import * as glob from 'glob';
import { copy, ensureDir, readJson } from 'fs-extra';

export function copyProm(src, targ): Promise<{}> {
  return new Promise((resolve, reject) => {
    copy(src, targ, {clobber: true}, (err) => {
      if (err) {
        reject(err);
      }
      resolve()
    })
  });
}

export function globProm(path): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    glob(path, (err, paths) => {
      if (err) {
        reject(err);
      }
      resolve(paths);
    })
  });
}

export function createDir(path): Promise<{}> {
  return new Promise((resolve, reject) => {
    ensureDir(path, (err) => {
      if (err) {
        reject(err);
      }
      resolve();
    })
  });
}

export async function asyncMap(array, f) {
  let returns = [];
  for (let item of array) {
    returns.push(await f(item));
  }
  return returns;
}

export function readJsonProm(path) {
  return new Promise((resolve, reject) => {
    readJson(path, (err, r: any) => {
      if (err) throw err;
      resolve(r)
    })
  });
}