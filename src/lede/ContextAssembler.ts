import { mergeWith, isArray, isObject, isUndefined } from 'lodash';
import { request } from 'https';
import * as aml from 'archieml';

import { ProjectSettings } from '../interfaces/settings';
import { stat, Stats } from 'fs';
import DefaultProjectSettings from '../models/DefaultProjectSettings';
import { NamespaceError } from '../errors';


export default class ContextAssembler {
    public projectSettings: ProjectSettings;
    public context: any;
    public includePaths: Array<string>;
    
    constructor(public workingDir){};

    public assemble() {
        return this.getSettings()
            .then(settings => this.getContexts(settings))
            .then(ctxs => this.buildContext(ctxs))
            .then(_ => this.buildContentLoop())
            .then(_ => this.returnSelf());
    };
    
    private getSettings() {
        return ContextAssembler.gatherProjSettings(this.workingDir).then(settings => {
            this.projectSettings = settings;
            return settings
        });
    }
    
    private getContexts(settings) {
        let proms = [ContextAssembler.gatherContext(this.workingDir)];
        for (let templateName of settings.inheritanceChain) {
            let path = `${settings.inheritanceRoot}/${templateName}`;
            proms.push(ContextAssembler.gatherContext(path).then(ctx => [templateName, ctx]));
        }
        return Promise.all(proms);
    }
    
    private buildContext(contexts) {
        let mainCtx = contexts.shift();
        if (mainCtx.contentLoop) throw new NamespaceError('Property "contentLoop" cannot exist on base context object.');
        this.includePaths = [this.workingDir];
        for (let [contextName, context] of contexts) {
            if (!mainCtx.hasOwnProperty(contextName)) {
                mainCtx[contextName] = context;
            } else {
                throw new NamespaceError(`Cannot load template ${contextName} because a property of that name already exists on base context.`)
            }
            this.includePaths.push(`${this.projectSettings.inheritanceRoot}/${contextName}`);
        }
        this.context = mainCtx;
        return null;
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
    
    private buildContentLoop() {
        let contentLoop = this.projectSettings.contentLoop;
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
                    // console.log(x);
                    let result = "";
                    res.on('data', d => result += d);
                    res.on('error', e => reject(e));
                    res.on('end', () => {
                        let parsedResult: any = JSON.parse(result);
                        let plainUrl: string = parsedResult.exportLinks['text/plain'].slice(8);
                        options.hostname = plainUrl.split('/')[0];
                        options.path = `/${plainUrl.split('/').slice(1).join('/')}`;
                        request(options, res => {
                            parsedResult = "";
                            res.on('data', d => parsedResult += d);
                            res.on('error', e => reject(e));
                            res.on('end', () => {
                                this.context.content = aml.load(parsedResult);
                                resolve();
                            })
                        }).end()
                    });
                }).end();
            });
            
        }
    }
    
    private returnSelf() {
        return this;
    }
    
    private static gatherProjSettings(searchDir): Promise<ProjectSettings> {
        return new Promise((resolve, reject) => {
            let path = `${searchDir}/projectSettings.js`;
            stat(path, (err, stats: Stats) => {
                if (err && err.code !== 'ENOENT') reject(err);
                if (!err && stats.isFile()) {
                    // Here we are importing a user-written module so we want to catch any errors it may throw
                    try {
                        let SettingsConfig: ObjectConstructor = require(path).default;
                        resolve(this.mergeProjSettingsWithDefault(new SettingsConfig()));
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
    
    private static mergeProjSettingsWithDefault(customSettings) {
        let defaults = new DefaultProjectSettings();
        let merged = Object.assign({}, defaults);
        for (let prop in customSettings) {
            if (defaults.hasOwnProperty(prop)) {
                // If it's an array, concatenate it
                if (isArray(defaults[prop])) {
                    merged[prop] = defaults[prop].concat(customSettings[prop])
                } else if (prop !== 'CSSPreprocessor' && prop !== 'HtmlTemplateAssembler' && prop !== 'JSPreprocessor'){
                    // If it's not a compiler but it is an object, deep merge it
                    if (isObject(defaults[prop])) {
                        merged[prop] = mergeWith(defaults[prop], customSettings[prop], (dest, src) => {
                            if (isArray(dest)) {
                                return dest.concat(src);
                            } else {
                                if (src) return src;
                                return dest;
                            }
                        })
                    } else {
                        // If it's not a compiler or object and it exists, overwrite default
                        if (!isUndefined(customSettings[prop])) {
                            merged[prop] = customSettings[prop]
                        }
                    }
                } else {
                    // If it is a compiler, check if it exists and overwrite default
                    if (customSettings[prop]) {
                        merged[prop] = customSettings[prop];
                    }
                }
            } else {
                // If it doesn't exist on the default object, copy it over directly
                defaults[prop] = customSettings[prop];
            }
        }
        return merged;
    }
}