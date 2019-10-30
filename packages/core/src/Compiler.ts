export interface Compiler {
  compile(buf: Buffer, context?: any): Buffer;
}