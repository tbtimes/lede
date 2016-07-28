import * as glob from "glob";
import { copy, ensureDir, readJson, createReadStream, writeFile, stat, Stats } from "fs-extra";
import { exec } from 'child_process';

export function copyProm(src, targ): Promise<{}> {
  return new Promise((resolve, reject) => {
    copy(src, targ, {clobber: true}, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve()
    })
  });
}

export function globProm(path, cwd?): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    glob(path, {
      cwd: cwd ? cwd: process.cwd()
    }, (err, paths) => {
      if (err) {
        return reject(err);
      }
      return resolve(paths);
    })
  });
}

export function existsProm(path: string): Promise<{file: boolean, dir: boolean}> {
  return new Promise((resolve, reject) => {
    stat(path, (err, stats: Stats) => {
      if (err) return reject(err);
      return resolve({file: stats.isFile(), dir: stats.isDirectory()})
    })
  });
}

export function createDir(path): Promise<{}> {
  return new Promise((resolve, reject) => {
    ensureDir(path, (err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    })
  });
}

export async function asyncMap(array: Array<any>, f: (x: any) => any): Promise<Array<any>> {
  let returns = [];
  for (let item of array) {
    returns.push(await f(item));
  }
  return returns;
}

export function writeProm(data, file) {
  return new Promise((resolve, reject) => {
    writeFile(file, data, (err) => {
      if (err) {
        return reject(err)
      }
      return resolve()
    })
  });

}

export function readJsonProm(path) {
  return new Promise((resolve, reject) => {
    readJson(path, (err, r: any) => {
      if (err) {
        return reject(err);
      }
      return resolve(r)
    })
  });
}