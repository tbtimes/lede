import { Logger } from "bunyan";
import { ProjectModel } from "./";

export interface PageCompiler {
  configure(arg: {logger: Logger});
  compile(arg: {tree: ProjectModel, styles: CompiledMaterials, scripts: CompiledMaterials}): Promise<CompiledPage[]>;
}

export interface MaterialCompiler {
  configure(arg: {logger: Logger});
  compile(tree: ProjectModel): Promise<CompiledMaterials>;
}

export interface CompiledPage {
  path: string;
  renderedPage: string;
  files: Array<{name: string, content?: string, path?: string, overridableName?: string}>;
}

export interface CompiledMaterials {
  bits: {[pageName: string]: string};
  globals: {[pageName: string]: string};
}
