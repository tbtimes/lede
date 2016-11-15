import { Logger } from "bunyan";
import { join, basename } from "path";
const sander = require("sander");

import { MaterialCompiler, CompiledMaterials, PageTree } from "../interfaces";
import { mockLogger } from "../utils";
import { Es6Failed } from "../errors/CompilerErrors";

// Rollup stuff
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const multientry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const rollupPreset = require("babel-preset-es2015-rollup");
const includes = require("rollup-plugin-includepaths");
const commonjs = require("rollup-plugin-commonjs");


export class Es6Compiler {
  logger: Logger;
  cacheDir: string;

  constructor(arg?) {
    this.logger = arg.logger || <Logger><any>mockLogger;
    this.cacheDir = arg && arg.cacheDir ? arg.cacheDir : ".ledeCache";
  }

  async compile(tree: PageTree) {
    const cachePath = join(tree.workingDir, this.cacheDir);
    try {
      await this.buildCache(cachePath, tree);
    } catch (err) {
      throw err;
    }
    try {
      const [globals, bits] = await Promise.all([
        this.compileGlobals(cachePath, tree),
        this.compileBits(cachePath, tree)
      ]);
      return {bits, globals};
    } catch (err) {
      throw err;
    }
  }

  async compileBits(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    return rollup.rollup({
      entry: join(pageCachePath, "bits", "**/*.js"),
      context: "window",
      plugins: [
        includes({paths: [join(pageCachePath, "scripts")] }),
        multientry({exports: false}),
        nodeResolve({ browser: true }),
        commonjs({}),
        babel({ presets: [rollupPreset] })
      ]
    }).then(bundle => bundle.generate({ format: "iife", exports: "none", sourcemap: true }).code);
  }

  async compileGlobals(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    return rollup.rollup({
      entry: join(pageCachePath, "scripts", "**/*.js"),
      context: "window",
      plugins: [
        includes({ paths: [ join(pageCachePath, "scripts")] }),
        multientry({ exports: false }),
        nodeResolve({ browser: true }),
        commonjs({}),
        babel({ presets: [rollupPreset] })
      ]
    }).then(bundle => bundle.generate({format: "iife", exports: "none", sourceMap: true}).code);
  }

  async buildCache(cachePath: string, tree: PageTree) {
    // const bitPathRegex = new RegExp(".*\/(.*\/.*\.js)$")
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name, "scripts");

    return await Promise.all(
      // Write all scripts to cache
      tree.scripts.cache.map(x => {
        return sander.copyFile(x.path).to(join(pageCachePath, x.overridableName || x.name));
      })
    );
  }
}