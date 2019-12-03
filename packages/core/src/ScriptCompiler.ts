import {
  CompilerOptions,
  createEmitAndSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost,
  findConfigFile,
  sys
} from "typescript";



export class ScriptCompiler {
  constructor(private debug: boolean = true, opts: CompilerOptions) {}

  watchFiles(files: string[]) {
    const cfg = {};
    const createProgram = createEmitAndSemanticDiagnosticsBuilderProgram
    const host = createWatchCompilerHost(
      files,
      this.opts,

    )
  }
}