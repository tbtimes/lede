import { stat, Stats, mkdir } from 'fs';
import * as rmrf from 'rimraf';

import ContextAssembler from "./ContextAssembler";


export default class BitAssembler {
    public cachePath: string;
    
    constructor(cacheRoot){
        this.cachePath = `${cacheRoot}/.bitCache`;
    }
    
    public async assemble(projectReport: ContextAssembler) {
        let deps = projectReport.dependencies;
        
        // Check for cacheDir, create it if not exists, nuke it if exists
        await this.buildCache();

        for (let dep of deps) {
            await BitAssembler.assembleDependency(dep, this.cachePath)
        }

    }
    
    private buildCache() {
        return new Promise((resolve, reject) => {
            stat(this.cachePath, (err, stats: Stats) => {
                if (err && err.code !== 'ENOENT') reject(err);
                if (!err && stats.isDirectory()) {
                    // Here we want to clean out the cache
                    rmrf(`${this.cachePath}/**/*`, resolve);
                } else if (!err && stats.isFile()) {
                    reject(new Error("You have a file named .bitCache ... don't do that!"))
                } else {
                    // Else, ENOENT, make the cache dir
                    mkdir(this.cachePath, resolve);
                }
            })
        });
    }
    
    private static async assembleDependency(dep, cacheDir) {
        await this.compileStyles(dep, cacheDir);
        await this.compileScripts(dep, cacheDir);
        await this.moveHtml(dep, cacheDir);
    }

    private static compileStyles(dep, cacheDir) {}
    private static compileScripts(dep, cacheDir) {}
    private static moveHtml(dep, cacheDir) {}
}