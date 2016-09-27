import { join, basename } from "path";
import { Logger } from "bunyan";
const sander = require("sander");

import { Material } from "../models/Material";
import { mockLogger } from "../DefaultLogger";
import { asyncMap } from "../utils";
import { PageTree, PageModel } from "../interfaces/PageTree";


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
  logger: Logger;

  constructor(opts: any) {
    this.cacheBits = {};
    this.cacheGlobals = {};
    this.logger = <any>mockLogger();
  };

  configure({ logger }) {
    this.logger = logger;
  }

  async compile(tree: PageTree) {
    const cachePath = join(tree.workingDir, ".ledeCache");
    try {
      await this.buildCache(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while caching the scripts");
      process.exit(1);
    }
    let globals, bits;
    try {
      globals = await this.compileGlobals(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling global scripts");
      process.exit(1);
    }

    try {
      bits = await this.compileBits(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling bit scripts");
      process.exit(1);
    }

    return {bits, globals};
  };

  async compileGlobals(cachePath: string, pageTree: PageTree) {
    const globals = {};
    for (let page: PageModel of pageTree.pages) {
      const pageCachePath = join(cachePath, page.name);
      const bundle = await rollup.rollup({
        entry: join(pageCachePath, "scripts", "**/*.js"),
        cache: this.cacheGlobals[page.name],
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          babel({ presets: [rollupPreset] })
        ]
      });
      this.cacheGlobals[page.name] = bundle;
      globals[page.name] = bundle.generate({ format: "iife", exports: "none", sourceMap: true });
    }
    return globals;
  }

  async compileBits(cachePath: string, pageTree: PageTree) {
    const bits = {};
    for (let page: PageModel of pageTree.pages) {
      const pageCachePath = join(cachePath, page.name);
      const bundle = await rollup.rollup({
        entry: join(pageCachePath, "bits", "**/*.js"),
        cache: this.cacheBits[page.name],
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          babel({ presets: [rollupPreset] })
        ]
      });
      this.cacheBits[page.name] = bundle;
      bits[page.name] = bundle.generate({ format: "iife", exports: "none", sourceMap: true });
    }
    return bits;
  }

  async buildCache(cachePath: string, pageTree: PageTree) {
    for (let page: PageModel of pageTree.pages) {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.js)$");
      const pageCachePath = join(cachePath, page.name);

      await Promise.all(page.cache.scripts.map(mat => {
        return sander.writeFile(join(pageCachePath, "scripts", mat.overridableName || mat.name || basename(mat.location)), mat.content);
      }));

      await Promise.all(page.scripts.globals.map(mat => {
        return sander.writeFile(join(pageCachePath, "scripts", mat.overridableName || mat.name || basename(mat.location)), mat.content);
      }));

      await Promise.all(page.scripts.bits.map(mat => {
        return sander.writeFile(join(pageCachePath, "bits", mat.location.match(bitPathRegex)[1]), mat.content);
      }));
    }
  }
}