import { Logger } from "bunyan";
import { request, RequestOptions } from "https";


class MLogger {
  called: any;
  constructor() {
    this.called = {
      info: 0,
      warn: 0,
      error: 0,
      trace: 0,
      debug: 0,
      fatal: 0,
    };
  }
  info() {
    this.called.info += 1;
  };
  warn() {
    this.called.warn += 1;
  };
  error() {
    this.called.error += 1;
  };
  trace() {
    this.called.trace += 1;
  };
  debug() {
    this.called.debug += 1;
  };
  fatal() {
    this.called.fatal += 1;
  };
}

export const mockLogger: Logger = <any>new MLogger();

export function httpsGetProm(options: RequestOptions): Promise<string> {
  options.method = "GET";
  return new Promise((resolve, reject) => {
    const req = request(options, res => {
      const buffers = [];
      res.on("data", d => buffers.push(d));
      res.on("error", e => reject(e));
      res.on("end", () => {
        const buffer = Buffer.concat(buffers);
        resolve(buffer.toString("utf8"));
      });
    });
    req.on("error", e => reject(e));
    req.end();
  });
}

export function flatten(a: Array<any>): any[] {
  return Array.isArray(a) ? [].concat(...a.map(flatten)) : a;
}