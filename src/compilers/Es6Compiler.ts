import { Logger } from "bunyan";
import { join, basename } from "path";
const sander = require("sander");

import { MaterialCompiler, PageTree } from "../interfaces";
import { mockLogger } from "../utils";


// Rollup stuff
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const multientry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const includes = require("rollup-plugin-includepaths");
const commonjs = require("rollup-plugin-commonjs");


export class Es6Compiler implements MaterialCompiler {
  logger: Logger;
  cacheDir: string;

  constructor(arg?) {
    this.logger = arg && arg.logger || mockLogger;
    this.cacheDir = arg && arg.cacheDir ? arg.cacheDir : ".ledeCache";
  }

  async compile(tree: PageTree): Promise<string> {
    const cachePath = join(tree.workingDir, this.cacheDir);
    try {
      await Es6Compiler.buildCache(cachePath, tree);
    } catch (err) {
      throw err;
    }
    try {
      const [globals, bits] = await Promise.all([
        Es6Compiler.compileGlobals(cachePath, tree),
        Es6Compiler.compileBits(cachePath, tree)
      ]);
      return `${globals}\n${bits}`;
    } catch (err) {
      throw err;
    }
  }

  private static compileBits(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    return rollup.rollup({
      entry: tree.scripts.bits,
      context: "window",
      plugins: [
        includes({paths: [join(pageCachePath, "scripts")] }),
        multientry({exports: false}),
        nodeResolve({ jsnext: true, main: true }),
        commonjs({}),
        babel({
          presets: [
            [
              "es2015",
              {
                "modules": false
              }
            ]
          ],
          "plugins": [
            "external-helpers"
          ],
          exclude: "node_modules/**"
        })
      ]
    }).then(bundle => bundle.generate({ format: "iife", exports: "none", sourcemap: true }).code);
  }

  private static compileGlobals(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    return rollup.rollup({
      entry: tree.scripts.globals.map(x => x.path),
      context: "window",
      plugins: [
        includes({ paths: [ join(pageCachePath, "scripts")] }),
        multientry({ exports: false }),
        nodeResolve({ jsnext: true }),
        commonjs({}),
        babel({
          presets: [
            [
              "es2015",
              {
                "modules": false
              }
            ]
          ],
          "plugins": [
            "external-helpers"
          ],
          exclude: "node_modules/**"
        })
      ]
    }).then(bundle => bundle.generate({format: "iife", exports: "none", sourceMap: true}).code);
  }

  private static buildCache(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name, "scripts");

    return Promise.all(
      // Write all scripts to cache
      tree.scripts.cache.map(x => {
        return sander.copyFile(x.path).to(join(pageCachePath, x.overridableName || x.name));
      })
    );
  }
}