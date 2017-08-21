import * as glob from "glob";

export function globProm(globStr: string, options: any) {
  return new Promise((resolve, reject) => {
    glob(globStr, options, (err, files) => {
      if (err) return reject(err);
      return files;
    })
  });
}