import { createLogger } from "bunyan";
import { resolve } from 'path';

export function makeLogger(ledeHome, level = "info") {
  return createLogger({
    name: "LedeLogger",
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
