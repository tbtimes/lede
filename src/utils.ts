import { Logger } from "bunyan";
import { request, RequestOptions } from "https";


export const mockLogger: Logger = <any>{
  info: function() {},
  warn: function() {},
  error: console.log,
  trace: function() {},
  debug: function() {},
  fatal: function() {},
};

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

export const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;