import { createLogger, stdSerializers } from "bunyan";
import { resolve } from 'path';

export function makeLogger(ledeHome, level = "info") {
  return createLogger({
    name: "LedeLogger",
    serializers: {
      err: stdSerializers.err
    },
    streams: [
      {
        level: level,
        stream: process.stdout
      },
      {
        level: "debug",
        path: resolve(ledeHome, "logs", "lede.log")
      }
    ]
  })
}
