import * as glob from "glob";


export function globProm(path, cwd?): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    glob(path, {
      cwd: cwd ? cwd: process.cwd()
    }, (err, paths) => {
      if (err) {
        return reject(err);
      }
      return resolve(paths);
    });
  });
}