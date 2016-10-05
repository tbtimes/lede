import { request, RequestOptions } from "https";


export const mockLogger = {
  info: function() {},
  warn: function() {},
  error: function() {},
  trace: function() {},
  debug: function() {},
  fatal: function() {}
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