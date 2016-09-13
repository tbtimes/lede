import * as glob from "glob";
import { request, RequestOptions } from "https";

/**
 * Searches for files that match a glob-style pattern in directory cwd.
 * @param pattern
 * @param cwd
 * @returns {Promise<string[]>}
 */
export function globProm(pattern, cwd?): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    glob(pattern, {
      cwd: cwd ? cwd : process.cwd()
    }, (err, paths) => {
      if (err) {
        return reject(err);
      }
      return resolve(paths);
    });
  });
}

/**
 * Makes an https get request and returns a utf8 string
 * @param options
 * @returns {Promise<string>}
 */
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
    }).end();
  });
}

/**
 * Takes a collection and a promise returning iterator function that is called on every item of the collection
 * @param collection
 * @param fn
 * @returns {Promise<any[]>}
 */
export async function asyncMap(collection: any[], fn: (item: any) => Promise<any>): Promise<any[]> {
  const returns = [];
  for (let item of collection) {
    returns.push(await fn(item));
  }
  return returns;
}