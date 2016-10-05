import { Logger } from "bunyan";
import { MaterialCompiler } from "../interfaces";


export class SassCompiler implements MaterialCompiler {
  logger: Logger;

  constructor(arg) {};

  configure({ logger }) {
    this.logger = logger;
  }

  compile() {};
}