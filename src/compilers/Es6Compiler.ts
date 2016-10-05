import { Logger } from "bunyan";

import { MaterialCompiler } from "../interfaces";


export class Es6Compiler implements MaterialCompiler {
  logger: Logger;

  constructor(arg) {};

  configure({ logger }) {
    this.logger = logger;
  }

  compile() {};
}