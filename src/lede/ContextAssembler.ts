import { isArray, isObject, isUndefined, mergeWith, merge } from 'lodash';
import { request } from 'https';
import * as aml from 'archieml';

import { ProjectSettings } from '../interfaces/settings';
import { stat, Stats } from 'fs';
import DefaultProjectSettings from '../models/DefaultProjectSettings';
import { CircularDepError } from '../errors';


export default class ContextAssembler {
    public context: any;
    public dependencies: Array<ProjectSettings>;
    public content: Array<any>;
    
    constructor(public workingDir){
        this.content = [];
    };

    public assemble() {
        
        return this.gatherAllSettings()
            .then(_ => this.buildContext())
            .then(_ => this.buildContentLoop())
            .then(_ => this.returnSelf())
    };

    private buildContentLoop() {
        let contentLoop = this.dependencies[this.dependencies.length - 1].contentLoop;
        if (isArray(contentLoop)) {
            this.context.content = contentLoop
        } else if (isObject(contentLoop)) {
            // Authenticate and fetch from googledocs and parse aml
            return new Promise((resolve, reject) => {
                let apiKey = contentLoop.apiKey;
                let fileId = contentLoop.fileId;
                let options = {
                    hostname: 'www.googleapis.com',
                    path: `/drive/v2/files/${fileId}?key=${apiKey}`,
                    method: 'GET'
                };
                request(options, res => {
                    let result = "";
                    res.on('data', d => result += d);
                    res.on('error', e => reject(e));
                    res.on('end', () => {
                        let parsableResult: any = JSON.parse(result);
                        let plainUrl: string = parsableResult.exportLinks['text/plain'].slice(8);
                        options.hostname = plainUrl.split('/')[0];
                        options.path = `/${plainUrl.split('/').slice(1).join('/')}`;
                        request(options, res => {
                            parsableResult = "";
                            res.on('data', d => parsableResult += d);
                            res.on('error', e => reject(e));
                            res.on('end', () => {
                                // Have content - let's parse
                                if (!contentLoop.parseFn) {
                                    this.content = aml.load(parsableResult);
                                    resolve();
                                } else {
                                    this.content = contentLoop.parseFn(parsableResult);
                                    resolve();
                                }
                            })
                        }).end()
                    });
                }).end();
            });

        }
    }
    
    private async gatherAllSettings() {
        this.dependencies = await ContextAssembler.reportOnNode(this.workingDir).then(r => ContextAssembler.followLeaves(r, [], []))
    }

    private static async reportOnNode(searchDir) {
        let settings = await ContextAssembler.gatherSettings(searchDir);
        let leaves = [];
        for (let proj of settings.inheritanceChain) {
            leaves.push(`${settings.inheritanceRoot}/${proj}`)
        }
        settings.workingDir = searchDir;
        return {node: searchDir, settings, leaves}
    }
    
    private static async followLeaves(nodeReport, settingsArr, visited) {
        visited.push(nodeReport.node);
        for (let leaf of nodeReport.leaves) {
            let leafReport = await ContextAssembler.reportOnNode(leaf);
            if (!settingsArr.indexOf(leafReport.settings) > -1) {
                if (visited.indexOf(leafReport.node) > -1) {
                    throw new CircularDepError(`${leafReport.node} is relying on a project which has a dependency on itself`);
                }
                settingsArr = await ContextAssembler.followLeaves(leafReport, settingsArr, visited);
            }
        }
        settingsArr.push(nodeReport.settings);
        return settingsArr
    }

    private async buildContext() {
        let contexts = [];
        for (let dep of this.dependencies) {
            let context = await ContextAssembler.gatherContext(dep.workingDir);
            contexts.push(context);
        }
        this.context = merge(...contexts);
        return true;
    }
    
    private static gatherSettings(searchDir) {
        return new Promise((resolve, reject) => {
            let path = `${searchDir}/projectSettings.js`;
            stat(path, (err, stats: Stats) => {
                if (err && err.code !== 'ENOENT') reject(err);
                if (!err && stats.isFile()) {
                    // Here we are importing a user-written module so we want to catch any errors it may throw
                    try {
                        let SettingsConfig: ObjectConstructor = require(path).default;
                        resolve(ContextAssembler.mergeProjSettingsWithDefault(new SettingsConfig()));
                    } catch (e) {
                        reject(e)
                    }

                } else {
                    // Could not find any projectSettings.js, using default settings
                    resolve(new DefaultProjectSettings());
                }
            })
        })
    }
    
    private static gatherContext(searchDir) {
        return new Promise((resolve, reject) => {
            let pathToContext = `${searchDir}/baseContext.js`;
            stat(pathToContext, (err, stats: Stats) => {
                if (err) reject(err);
                if (!err && stats.isFile()) {
                    // Here we are importing a user-written module so we want to catch any errors it may throw
                    try {
                        let Context: ObjectConstructor = require(pathToContext).default;
                        resolve(new Context())
                    } catch (e) {
                        reject(e)
                    }
                }
            })
        })
    }
    
    private returnSelf() {
        return this;
    }
    
    private static mergeProjSettingsWithDefault(customSettings) {
        let defaults = new DefaultProjectSettings();
        let merged = Object.assign({}, defaults);
        
        for (let prop in customSettings) {
            if (defaults.hasOwnProperty(prop)) {
                switch(prop) {
                    
                    // Inheritance chain should be concatenated onto the default
                    case 'inheritanceChain':
                        merged[prop] = merged[prop].concat(customSettings[prop]);
                        break;
                    
                    // All of these should override the default if they exist
                    case 'HtmlTemplateAssembler':
                    case 'JSPreprocessor':
                    case 'CSSPreprocessor':
                    case 'contentLoop':
                    case 'imageMap':
                    case 'inheritanceRoot':
                    case 'shellPage':
                        if (customSettings[prop]) {
                            merged[prop] = customSettings[prop];
                        }
                        break;
                    
                    // Override defaults for specified mappings
                    case 'inheritancePathMap':
                        for (let key in defaults[prop]) {
                            if (customSettings[prop][key]) {
                                merged[prop][key] = customSettings[prop][key];
                            }
                        }
                        break;
                    
                    // Use project setting unless it is undefined
                    case 'debug':
                        if (!isUndefined(customSettings[prop])) {
                            merged[prop] = customSettings[prop]
                        }
                        break;
                }
            } else if (customSettings.hasOwnProperty(prop) && !isUndefined(customSettings[prop])) {
                merged[prop] = customSettings[prop];
            }
        }
        
        return merged;
    }
}