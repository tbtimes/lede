import { copy, readJson } from 'fs-extra';
import * as glob from 'glob';

import ContextAssembler from "./ContextAssembler";


export default class CacheBuilder {
    public cachePath: string;
    
    constructor(cacheRoot){
        this.cachePath = `${cacheRoot}/.ledeCache`;
    }
    
    public async assemble(projectReport: ContextAssembler) {
        let deps = projectReport.dependencies;
        
        for (let dep of deps) {
            await CacheBuilder.assembleDependency(dep, this.cachePath);
        }
    }

    private static async assembleDependency(dep, cacheDir) {
        let globalStyleRoot = `${dep.inheritancePathMap.css(dep.workingDir)}/**`;
        let styleRegex = new RegExp(`${dep.inheritancePathMap.css(dep.workingDir)}/styles/(.+)`);
        let globalScriptRoot = `${dep.inheritancePathMap.js(dep.workingDir)}/**/*.`;
        let globalTemplateRoot = `${dep.inheritancePathMap.html(dep.workingDir)}/**/*.`;
        let bitRoot = `${dep.inheritancePathMap.bits(dep.workingDir)}/*`;

        // Copy over globals
        let globalStyles = await CacheBuilder.globProm(globalStyleRoot);
        globalStyles = globalStyles.slice(1);
        for (let path of globalStyles) {
            // dest needs to be a file name, not a directory
            console.log(path.search(styleRegex))
            await CacheBuilder.copyProm(path, `${cacheDir}/styles`)
        }
        
        // let globalScripts = await CacheBuilder.globProm(globalScriptRoot);
        // for (let path of globalScripts) {
        //     await CacheBuilder.copyProm(path, `${cacheDir}/scripts`)
        // }
        //
        // let globalTemplates = await CacheBuilder.globProm(globalTemplateRoot);
        // for (let path of globalTemplates) {
        //     await CacheBuilder.copyProm(path, `${cacheDir}/templates`)
        // }

        // Copy over bits
        let bitPaths = await CacheBuilder.globProm(bitRoot);
        for (let bit of bitPaths) {
            let json = await CacheBuilder.readJsonProm(`${bit}/bitConfig.json`);
            await CacheBuilder.copyProm(`${bit}/${json.style}`, 
                `${cacheDir}/bits/${json.name}.${json.style.split('.')[json.style.split('.').length - 1]}`);

            await CacheBuilder.copyProm(`${bit}/${json.script}`,
                `${cacheDir}/bits/${json.name}.${json.script.split('.')[json.script.split('.').length - 1]}`);
            
            await CacheBuilder.copyProm(`${bit}/${json.template}`,
                `${cacheDir}/bits/${json.name}.${json.template.split('.')[json.template.split('.').length - 1]}`)
        }

        
        return true;
    }

    private static readJsonProm(path) {
        return new Promise((resolve, reject) => {
            readJson(path, (err, json) => {
                if (err) reject(err);
                resolve(json);
            })
        });
    }

    private static globProm(path) {
        return new Promise((resolve, reject) => {
            glob(path, (err, paths) => {
                if (err) reject(err);
                resolve(paths);
            })
        });
    }

    private static copyProm(src, dest) {
        return new Promise((resolve, reject) => {
            copy(src, dest, {clobber: true}, (err) => {
                if (err) reject(err);
                resolve();
            });
        });
    }
}