import { CompiledPage } from "./Compiler";
import { Logger } from "bunyan";

export interface Deployer {
  deploy(pages: CompiledPage[]): void;
  configure(opts: {logger: Logger}): void;
}