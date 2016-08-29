/* tslint:disable */
import { writeJson, stat, Stats, mkdir, ensureDir } from 'fs-extra';
import * as rmrf from 'rimraf';
import { join, resolve as presolve, basename } from 'path';

import { ProjectReport, Dependency } from '../interfaces';
import { copyProm, globProm, createDir } from '../utils';

export class CacheBuilder {
  constructor(public project: ProjectReport) {
  }

  async buildCache() {
    let cacheDir = join(this.project.workingDirectory, '.ledeCache');
    await CacheBuilder.createCache(this.project.dependencies, cacheDir);
    await CacheBuilder.buildDepCache(this.project.dependencies, cacheDir);
  }

  static async buildDepCache(deps: Array<Dependency>, buildDir: string) {
  for (let dep of deps) {
      let currPath = dep.workingDir;
      let globalStyles = await globProm("styles/*", currPath);
      let bits = await globProm("bits/*", currPath);
      let scripts = await globProm("scripts/*", currPath);
      let blocks = await globProm("blocks/*", currPath);
      let assets = await globProm("assets/*", currPath);
      
      for (let s of globalStyles) {
        await copyProm(join(currPath, s), join(buildDir, "styles", dep.name, basename(s)))
      }
      for (let s of bits) {
        await copyProm(join(currPath, s), join(buildDir, "bits", dep.name, basename(s)))
      }
      for (let s of scripts) {
        await copyProm(join(currPath, s), join(buildDir, "scripts", dep.name, basename(s)))
      }
      for (let s of blocks) {
        await copyProm(join(currPath, s), join(buildDir, "blocks", dep.name, basename(s)))
      }
      for (let s of assets) {
        await copyProm(join(currPath, s), join(buildDir, "assets", dep.name, basename(s)))
      }
    }
  }

  static createCache(deps: Array<Dependency>, cacheDir: string) {
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
        await createDir(join(cacheDir, 'bits', dep.name));
        await createDir(join(cacheDir, 'styles', dep.name));
        await createDir(join(cacheDir, 'scripts', dep.name));
        await createDir(join(cacheDir, 'blocks', dep.name));
        await createDir(join(cacheDir, 'assets', dep.name))
      }
      resolve();
    }
  }
}