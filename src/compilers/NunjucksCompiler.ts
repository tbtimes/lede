import { Logger } from "bunyan";

import { PageCompiler } from "../interfaces";

export class NunjucksCompiler implements PageCompiler {
  logger: Logger;

  constructor(arg) {};

  configure({ logger }) {
    this.logger = logger;
  };

  compile() {};
}