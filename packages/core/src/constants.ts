import { CompilerOptions, ModuleKind, ModuleResolutionKind } from "typescript";


export const DEFAULT_TS_COMPILER_OPTS: CompilerOptions = {
  allowJs: true,
  allowSyntheticDefaultImports: true,
  alwaysString: true,
  baseUrl: "./",
  checkJs: true,
  downlevelIteration: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  importHelpers: true,
  // lib: ,
  rootDirs: ["scripts"],
  moduleResolution: ModuleResolutionKind.NodeJs,
  module: ModuleKind.ESNext
};