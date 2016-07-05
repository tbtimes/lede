import { writeJson, stat, Stats, mkdir, ensureDir } from 'fs-extra';
import * as rmrf from 'rimraf';

import { ProjectReport, Dependency } from '../interfaces';
import { copyProm, globProm } from './utils';

export class CacheBuilder {
  constructor(public project:ProjectReport) {
  }

  async buildCache() {
    let cacheDir = `${this.project.workingDirectory}/.ledeCache`;
    await CacheBuilder.createCache(cacheDir, this.project.dependencies);

    await CacheBuilder.buildDepCache(this.project.dependencies, cacheDir);
    return `${this.project.workingDirectory}/.ledeCache/${this.project.dependencies[this.project.dependencies.length - 1].name}`
  }

  async update(depName) {
    let baseDep = this.project.dependencies.find(d => d.name === depName);
    let updateDeps = this.project.dependencies.slice(this.project.dependencies.indexOf(baseDep));
    await CacheBuilder.buildDepCache(updateDeps, `${this.project.workingDirectory}/.ledeCache`);
    return `${this.project.workingDirectory}/.ledeCache/${this.project.dependencies[this.project.dependencies.length - 1].name}`
  }

  static async buildDepCache(deps:Array<Dependency>, buildDir:string) {
    for (let i = 0; i < deps.length; i++) {
      let cachePath = `${buildDir}/${deps[i].name}`;

      // Bring in child deps
      if (i !== 0) {
        let prevPath = `${buildDir}/${deps[i - 1].name}`;
        let prevStyles = await globProm(`${prevPath}/styles/*`);
        let prevBits = await globProm(`${prevPath}/bits/*`);
        let prevBlocks = await globProm(`${prevPath}/blocks/*`);
        for (let style of prevStyles) {
          await copyProm(style, `${cachePath}/styles/${style.split('/')[style.split('/').length - 1]}`)
        }
        for (let bit of prevBits) {
          await copyProm(bit, `${cachePath}/bits/${bit.split('/')[bit.split('/').length - 1]}`)
        }
        for (let block of prevBlocks) {
          await copyProm(block, `${cachePath}/blocks/${block.split('/')[block.split('/').length - 1]}`)
        }
      }

      // Copy over this deps' files
      let currPath = deps[i].workingDir;
      let currStyles = await globProm(`${currPath}/styles/*`);
      let currBits = await globProm(`${currPath}/bits/*`);
      let currBlocks = await globProm(`${currPath}/blocks/*`);
      for (let style of currStyles) {
        await copyProm(style, `${cachePath}/styles/${style.split('/')[style.split('/').length - 1]}`);
      }
      for (let bit of currBits) {
        await copyProm(bit, `${cachePath}/bits/${bit.split('/')[bit.split('/').length - 1]}`);
      }
      for (let block of currBlocks) {
        await copyProm(block, `${cachePath}/blocks/${block.split('/')[block.split('/').length - 1]}`);
      }
    }
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
          createDirAndDeps(resolve);
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
                      {dependedOnBy: dep.dependedOnBy}, (err) => {
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