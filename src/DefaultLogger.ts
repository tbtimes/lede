import { Logger, createLogger, stdSerializers } from "bunyan";
const PrettyStream = require("bunyan-prettystream");


export function defaultLogger() {
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
