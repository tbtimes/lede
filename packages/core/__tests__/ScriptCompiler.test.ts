import ScriptCompiler from "../src/ScriptCompiler";

test("foo", () => {
  const s = new ScriptCompiler({info: console.log, error: console.error});
  s.compileFiles(["/Users/emurray/WebstormProjects/lede/packages/core/src/index.ts"])
});