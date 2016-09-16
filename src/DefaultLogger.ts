import { Logger, createLogger, stdSerializers } from "bunyan";
const PrettyStream = require("bunyan-prettystream");


export function defaultLogger(): Logger {
  const stream = new PrettyStream();
  stream.pipe(process.stdout);
  return createLogger({
    name: "LedeLogger",
    stream: stream,
    level: "error",
    serializers: {
      err: stdSerializers["err"]
    }
  });
}

export function mockLogger() {
  return {
    info: function() {},
    warn: function() {},
    error: function() {},
    trace: function() {},
    debug: function() {},
    fatal: function() {}
  };
}
