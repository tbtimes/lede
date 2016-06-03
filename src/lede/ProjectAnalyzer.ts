import { ProjectSettings } from '../interfaces/settings';
import { stat, Stats } from 'fs';
import DefaultProjectSettings from '../models/DefaultProjectSettings'

export default class ProjectAnalyzer {
    public projectSettings: ProjectSettings;

    constructor(private workingDir:string){}

    public gatherAllSettings() {
        let prjSettingsProm = this.gatherProjSettings();
    }

    public gatherProjSettings(): Promise<ProjectSettings> {
        return new Promise((resolve, reject) => {
            let path = `${this.workingDir}/projectSettings.js`;
            stat(path, (err, stats: Stats) => {
                if (err && err.code !== 'ENOENT') reject(err);
                if (!err && stats.isFile()) {
                    // Here we are importing the module so we want to catch any errors it throws
                    try {
                        let SettingsConfig = require(path).default;
                        resolve(this.mergeSettingsWithDefault(new SettingsConfig()));
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

    private mergeSettingsWithDefault(customSettings) {
        return Object.assign(new DefaultProjectSettings, customSettings);
    }
}