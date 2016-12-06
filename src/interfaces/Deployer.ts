import { CompiledPage } from "./Compiler";
import { Logger } from "bunyan";

export interface Deployer {
  deploy(page: CompiledPage): void;
}