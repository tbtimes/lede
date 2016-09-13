import { inspect } from "util";
import { join } from "path";
const sander = require("sander");

import { Material } from "../models/Material";
import { asyncMap } from "../utils";
import { PageTree } from "../interfaces/PageTree";


// Rollup stuffs
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const multientry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const rollupPreset = require("babel-preset-es2015-rollup");
const includes = require("rollup-plugin-includepaths");


export class Es6Compiler {
  cacheBits: any;
  cacheGlobals: any;

  constructor(opts: any) {
    this.cacheBits = {};
    this.cacheGlobals = {};
  };

  async compile(workingDir, tree: PageTree) {
    const cachePath = join(workingDir, ".ledeCache");
    await this.buildCache(cachePath, tree);
    const globals = await this.compileGlobals(cachePath, tree);
    const bits = await this.compileBits(cachePath, tree);
    return {bits, globals};
  };

  async compileGlobals(cachePath: string, pageTree: PageTree) {
    const globals = {};
    for (let page in pageTree["scripts"]) {
      const pageCachePath = join(cachePath, page);
      const bundle = await rollup.rollup({
        entry: join(pageCachePath, "scripts", "**/*.js"),
        cache: this.cacheGlobals[page],
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          babel({ presets: [rollupPreset] })
        ]
      });
      this.cacheGlobals[page] = bundle;
      globals[page] = bundle.generate({ format: "iife", exports: "none", sourceMap: true });
    }
    return globals;
  }

  async compileBits(cachePath: string, pageTree: PageTree) {
    const bits = {};
    for (let page in pageTree["scripts"]) {
      const pageCachePath = join(cachePath, page);
      const bundle = await rollup.rollup({
        entry: join(pageCachePath, "bits", "**/*.js"),
        cache: this.cacheBits[page],
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          babel({ presets: [rollupPreset] })
        ]
      });
      this.cacheBits[page] = bundle;
      bits[page] = bundle.generate({ format: "iife", exports: "none", sourceMap: true });
    }
    return bits;
  }

  async buildCache(cachePath: string, pageTree: PageTree) {
    for (let page in pageTree.scripts) {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.js)$");
      const pageCachePath = join(cachePath, page);

      await asyncMap(pageTree["scripts"][page].globals, async(mat: Material) => {
        await sander.writeFile(join(pageCachePath, "scripts", mat.overridableName), mat.content);
      });
      await asyncMap(pageTree["scripts"][page].bits, async(mat: Material) => {
        await sander.writeFile(join(pageCachePath, "bits", mat.location.match(bitPathRegex)[1]), mat.content);
      });
    }
  }
}