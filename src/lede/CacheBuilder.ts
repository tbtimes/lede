import { writeJson, stat, Stats, mkdir, ensureDir } from 'fs-extra';
import * as rmrf from 'rimraf';

import { ProjectReport, Dependency } from '../interfaces';
import { copyProm, globProm, createDir } from '../utils';

export class CacheBuilder {
  constructor(public project: ProjectReport) {
  }

  async buildCache() {
    let cacheDir = `${this.project.workingDirectory}/.ledeCache`;
    await CacheBuilder.createCache(cacheDir, this.project.dependencies);

    await CacheBuilder.buildDepCache(this.project.dependencies, cacheDir);
    return `${this.project.workingDirectory}/.ledeCache/`
  }

  static async buildDepCache(deps: Array<Dependency>, buildDir: string) {
    for (let dep of deps) {
      let currPath = dep.workingDir;
      let globalStyles = await globProm(`${currPath}/styles/*`);
      let bits = await globProm(`${currPath}/bits/*`);
      let scripts = await globProm(`${currPath}/scripts/*`);
      let blocks = await globProm(`${currPath}/blocks/*`);
      let assets = await globProm(`${currPath}/assets/*`);

      globalStyles.forEach(async(s) => {
        await copyProm(s, `${buildDir}/styles/${dep.name}/${s.split('/')[s.split('/').length - 1]}`)
      });
      bits.forEach(async(s) => {
        await copyProm(s, `${buildDir}/bits/${dep.name}/${s.split('/')[s.split('/').length - 1]}`)
      });
      scripts.forEach(async(s) => {
        await copyProm(s, `${buildDir}/scripts/${dep.name}/${s.split('/')[s.split('/').length - 1]}`)
      });
      blocks.forEach(async(s) => {
        await copyProm(s, `${buildDir}/blocks/${dep.name}/${s.split('/')[s.split('/').length - 1]}`)
      });
      assets.forEach(async(s) => {
        await copyProm(s, `${buildDir}/assets/${dep.name}/${s.split('/')[s.split('/').length - 1]}`)
      });
    }
  }

  static createCache(cacheDir: string, deps: Array<Dependency>) {
    return new Promise((resolve, reject) => {
      stat(cacheDir, (err: any, stats: Stats) => {
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

    async function createDirAndDeps(resolve) {
      await createDir(cacheDir);
      for (let dep of deps) {
        await createDir(`${cacheDir}/bits/${dep.name}`);
        await createDir(`${cacheDir}/styles/${dep.name}`);
        await createDir(`${cacheDir}/scripts/${dep.name}`);
        await createDir(`${cacheDir}/blocks/${dep.name}`);
        await createDir(`${cacheDir}/assets/${dep.name}`)
      }
      resolve();
    }
  }
}