import {
  CompilerOptions,
  createEmitAndSemanticDiagnosticsBuilderProgram,
  createWatchCompilerHost, createWatchProgram, Diagnostic,
  findConfigFile, flattenDiagnosticMessageText, formatDiagnostic, FormatDiagnosticsHost,
  createProgram, getPreEmitDiagnostics,
  sys,
} from "typescript";
import { DEFAULT_TS_COMPILER_OPTS } from "./constants";



export default class ScriptCompiler {
  formatHost: FormatDiagnosticsHost = {
    getCanonicalFileName: path => path,
    getCurrentDirectory: sys.getCurrentDirectory,
    getNewLine: () => sys.newLine
  };
  private opts: CompilerOptions;

  constructor(
    private logger: any,
    private debug: boolean = true,
    opts?: CompilerOptions,
  ) {
    this.opts = opts ? ScriptCompiler.mergeConfigs(DEFAULT_TS_COMPILER_OPTS, opts) : DEFAULT_TS_COMPILER_OPTS;
  }

  public compileFiles(files: string[], cfg?: CompilerOptions): void {
    const program = createProgram(files, cfg ? ScriptCompiler.mergeConfigs(this.opts, cfg) : this.opts);
    const result = program.emit();
    for (let d of getPreEmitDiagnostics(program).concat(result.diagnostics)) {
      this.reportDiagnostic(d);
    }
    console.log(result);
  }

  public watchFiles(files: string[], cfg?: CompilerOptions): void {
    const createProgram = createEmitAndSemanticDiagnosticsBuilderProgram;
    const host = createWatchCompilerHost(
      files,
      cfg ? ScriptCompiler.mergeConfigs(this.opts, cfg) : this.opts,
      sys,
      createProgram,
      this.reportDiagnostic.bind(this),
      this.reportWatchStatusChanged.bind(this)
    );
    createWatchProgram(host);
  }

  public watchFromConfig(cfgPath: string): void {
    const createProgram = createEmitAndSemanticDiagnosticsBuilderProgram;
    const host = createWatchCompilerHost(
      cfgPath,
      {},
      sys,
      createProgram,
      this.reportDiagnostic.bind(this),
      this.reportWatchStatusChanged.bind(this)
    );
    createWatchProgram(host);
  }

  // Handles reporting errors
  private reportDiagnostic(d: Diagnostic) {
    const {line, character} = d.file.getLineAndCharacterOfPosition(d.start);
    this.logger.error(
      `${d.file.fileName} (${line + 1}, ${character + 1}): ${flattenDiagnosticMessageText(d.messageText, this.formatHost.getNewLine())}`
    );
  }

  // Handles reporting compilation status (start/stop/etc.)
  private reportWatchStatusChanged(d: Diagnostic) {
    this.logger.info(
      formatDiagnostic(d, this.formatHost)
    );
  }

  static mergeConfigs(baseCfg: CompilerOptions, newCfg: CompilerOptions): CompilerOptions {
    return {...baseCfg, ...newCfg}
  }
}
