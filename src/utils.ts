import * as glob from 'glob';
import { copy, ensureDir } from 'fs-extra';

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