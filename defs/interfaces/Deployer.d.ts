import { CompiledPage } from "./Compiler";
export interface Deployer {
    deploy(page: CompiledPage): void;
}
