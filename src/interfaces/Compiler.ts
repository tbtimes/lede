import { PageTree } from "./PageTree";
import { ProjectReport } from "../models/Project";

export interface CompilerInitializer {
  compilerClass: any;
  constructorArg: any;
}

export interface CompiledPage {
  path: string;
  renderedPage: string;
  files: Array<{name: string, content: string}>;
}

export interface HtmlCompiler {
  compile(arg: {report: ProjectReport, styles: any, scripts: any}): Promise<CompiledPage[]>;
}

export interface CompiledIncludes {
  bits: any;
  globals: any;
}

export interface Compiler {
  compile(workingDir, tree: PageTree): Promise<CompiledIncludes>;
}