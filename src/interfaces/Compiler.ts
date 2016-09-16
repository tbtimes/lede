import { Logger } from "bunyan";

import { PageTree } from "./PageTree";

export interface CompilerInitializer {
  compilerClass: any;
  constructorArg: any;
}

export interface CompiledPage {
  path: string;
  renderedPage: string;
  files: Array<{name: string, content: string}>;
}

export interface CompiledAssets {
  bits: { [pageName: string]: string };
  globals: { [pageName: string]: string };
}

export interface HtmlCompiler {
  configure(arg: {logger: Logger});
  compile(arg: {pageTree: PageTree, styles: CompiledAssets, scripts: CompiledAssets}): Promise<CompiledPage[]>;
}

export interface CompiledIncludes {
  bits: any;
  globals: any;
}

export interface Compiler {
  configure(arg: {logger: Logger});
  compile(tree: PageTree): Promise<CompiledIncludes>;
}