import { CompiledPage } from "./Compiler";

export interface Deployer {
  deploy(pages: CompiledPage[]): void;
}