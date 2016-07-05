import { copy, readJson, writeJson, stat, Stats, mkdir, ensureDir } from 'fs-extra';
import * as rmrf from 'rimraf';
import * as glob from 'glob';

import { ProjectReport, Dependency } from '../interfaces';

export class CacheBuilder {
  constructor(public project:ProjectReport) {
  }

  async buildCache() {
    let cacheDir = `${this.project.workingDirectory}/.ledeCache`;
    await CacheBuilder.createCache(cacheDir, this.project.dependencies);

    await CacheBuilder.buildDepCache(this.project.dependencies, cacheDir);
  }

  async static buildDepCache(deps:Array<Dependency>, buildDir:string) {
    for (let i = 0; i < deps.length; i++) {
      let cachePath = `${buildDir}/${deps[i].name}`;
      
      // Bring in child deps
      if (i !== 0) {
        let prevPath = `${buildDir}/${deps[i - 1].name}`;
        let prevStyles = await CacheBuilder.globProm(`${prevPath}/styles/*`);
        let prevBits = await CacheBuilder.globProm(`${prevPath}/bits/*`);
        let prevBlocks = await CacheBuilder.globProm(`${prevPath}/blocks/*`);
        for (let style of prevStyles) {
          await CacheBuilder.copyProm(style, `${cachePath}/styles/${style.split('/')[style.split('/').length - 1]}`)
        }
        for (let bit of prevBits) {
          await CacheBuilder.copyProm(bit, `${cachePath}/bits/${bit.split('/')[bit.split('/').length - 1]}`)
        }
        for (let block of prevBlocks) {
          await CacheBuilder.copyProm(block, `${cachePath}/blocks/${block.split('/')[block.split('/').length - 1]}`)
        }
      }
      
      // Copy over this deps' files
      let currPath = deps[i].workingDir;
      let currStyles = await CacheBuilder.globProm(`${currPath}/styles/*`);
      let currBits = await CacheBuilder.globProm(`${currPath}/bits/*`);
      let currBlocks = await CacheBuilder.globProm(`${currPath}/blocks/*`);
      for (let style of currStyles) {
        await CacheBuilder.copyProm(style, `${cachePath}/styles/${style.split('/')[style.split('/').length - 1]}`);
      }
      for (let bit of currBits) {
        await CacheBuilder.copyProm(bit, `${cachePath}/bits/${bit.split('/')[bit.split('/').length - 1]}`);
      }
      for (let block of currBlocks) {
        await CacheBuilder.copyProm(block, `${cachePath}/blocks/${block.split('/')[block.split('/').length - 1]}`);
      }
    }
  }
  
  static copyProm(src, targ) {
    return new Promise((resolve, reject) => {
        copy(src, targ, {clobber: true}, (err) => {
          if (err) reject(err);
          resolve()
        })
    });
  }

  static globProm(path) {
    return new Promise((resolve, reject) => {
      glob(path, (err, paths) => {
        if (err) {
          reject(err);
        }
        resolve(paths);
      })
    });
  }

  static createCache(cacheDir:string, deps:Array<Dependency>) {
    return new Promise((resolve, reject) => {
      stat(cacheDir, (err:any, stats:Stats) => {
        if (err && err.code !== 'ENOENT') {
          reject(err)
        } else if (stats && stats.isFile()) {
          reject(new Error('Cannot have file named .ledeCache in project'))
        } else if (stats && stats.isDirectory()) {
          rmrf(cacheDir, () => {
            createDirAndDeps(resolve);
          })
        } else {
          mkdir(cacheDir, () => {
            createDirAndDeps(resolve);
          })
        }
      })
    });

    function createDirAndDeps(resolve) {
      ensureDir(cacheDir, (err) => {
        if (err) {
          throw err;
        }
        for (let dep of deps) {
          mkdir(`${cacheDir}/${dep.name}`, (err) => {
            if (err) {
              throw err;
            }
            writeJson(`${cacheDir}/${dep.name}/.depCacheSettings.json`,
                      {dependsOn: dep.dependsOn, dependedOnBy: dep.dependedOnBy}, (err) => {
                if (err) {
                  throw err;
                }
                resolve();
              })
          })
        }
      })
    }
  }
}