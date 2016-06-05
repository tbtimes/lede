import * as _ from 'lodash';

import { ProjectSettings } from '../interfaces/settings';
import { stat, Stats } from 'fs';
import DefaultProjectSettings from '../models/DefaultProjectSettings';


export default class ProjectAnalyzer {
    constructor(){}

    public static gatherContext(workingDir) {
        return new Promise((resolve, reject) => {
            let pathToContext = `${workingDir}/baseContext.js`;
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

    public static gatherProjSettings(workingDir): Promise<ProjectSettings> {
        return new Promise((resolve, reject) => {
            let path = `${workingDir}/projectSettings.js`;
            stat(path, (err, stats: Stats) => {
                if (err && err.code !== 'ENOENT') reject(err);
                if (!err && stats.isFile()) {
                    // Here we are importing a user-written module so we want to catch any errors it may throw
                    try {
                        let SettingsConfig: ObjectConstructor = require(path).default;
                        resolve(ProjectAnalyzer.mergeProjSettingsWithDefault(new SettingsConfig()));
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

    public static mergeProjSettingsWithDefault(customSettings) {
        let defaults = new DefaultProjectSettings();
        let merged = Object.assign({}, defaults);
        for (let prop in customSettings) {
            if (defaults.hasOwnProperty(prop)) {
                // If it's an array, concatenate it
                if (_.isArray(defaults[prop])) {
                    merged[prop] = defaults[prop].concat(customSettings[prop])
                } else if (prop !== 'CSSPreprocessor' && prop !== 'HtmlTemplateAssembler' && prop !== 'JSPreprocessor'){
                    // If it's not a compiler but it is an object, deep merge it
                    if (_.isObject(defaults[prop])) {
                        merged[prop] = _.mergeWith(defaults[prop], customSettings[prop], (dest, src) => {
                            if (_.isArray(dest)) {
                                return dest.concat(src);
                            } else {
                                if (src) return src;
                                return dest;
                            }
                        })
                    } else {
                        // If it's not a compiler or object and it exists, overwrite default
                        if (!_.isUndefined(customSettings[prop])) {
                            merged[prop] = customSettings[prop]
                        }
                    }
                } else {
                    // If it is a compiler, check for null and overwrite default
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