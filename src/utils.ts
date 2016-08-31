import * as glob from "glob";
import { request, RequestOptions } from "https";


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

export function httpsGetProm(options: RequestOptions): Promise<string> {
  options.method = "GET";
  return new Promise((resolve, reject) => {
    request(options, res => {
      const buffers = [];
      res.on("data", d => buffers.push(d));
      res.on("error", e => reject(e));
      res.on("end", () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer.toString("utf8"));
      });
    });
  });
}