import { Logger } from "bunyan";
import { join, basename } from "path";
const sander = require("sander");

import { MaterialCompiler, CompiledMaterials, ProjectModel, PageModel } from "../interfaces";
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


export class Es6Compiler implements MaterialCompiler {
  logger: Logger;
  cacheBits: any;
  cacheGlobals: any;
  cacheDir: string;

  constructor(arg?) {
    this.cacheBits = {};
    this.cacheGlobals = {};
    this.logger = <Logger><any>mockLogger;
    this.cacheDir = arg && arg.cacheDir ? arg.cacheDir : ".ledeCache";
  };

  configure({ logger }) {
    this.logger = logger;
  }

  async compile(tree: ProjectModel): Promise<CompiledMaterials> {
    const cachePath = join(tree.workingDir, this.cacheDir);
    let globals, bits;
    try {
      await this.buildCache(cachePath, tree);
    } catch(err) {
      this.logger.error({err}, "An error occurred while caching the scripts");
      throw new Es6Failed({detail: err});
    }
    try {
      globals = await this.compileGlobals(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling global scripts");
      throw new Es6Failed({detail: err});
    }
    try {
      bits = await this.compileBits(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling bit scripts");
      throw new Es6Failed({detail: err});
    }

    return {bits, globals};
  };

  async compileBits(cachePath: string, tree: ProjectModel) {
    const bits = {};
    return Promise.all(tree.pages.map(page => {
      const pageCachePath = join(cachePath, page.context.$PAGE.$name);
      return rollup.rollup({
        entry: join(pageCachePath, "bits", "**/*.js"),
        cache: this.cacheBits[page.context.$PAGE.$name],
        context: "window",
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          commonjs({}),
          babel({ presets: [rollupPreset]})
        ]
      }).then(bundle => {
        this.cacheBits[page.context.$PAGE.$name] = bundle;
        bits[page.context.$PAGE.$name] = bundle.generate({ format: "iife", exports: "none", sourceMap: true }).code;
      });
    })).then(() => {
      return bits;
    });
  }

  async compileGlobals(cachePath: string, tree: ProjectModel) {
    const globals = {};
    return Promise.all(tree.pages.map(page => {
      const pageCachePath = join(cachePath, page.context.$PAGE.$name);
      return rollup.rollup({
        entry: join(pageCachePath, "scripts", "**/*.js"),
        cache: this.cacheGlobals[page.context.$PAGE.$name],
        context: "window",
        plugins: [
          includes({ paths: [ join(pageCachePath, "scripts")] }),
          multientry({ exports: false }),
          nodeResolve({ browser: true }),
          commonjs({}),
          babel({ presets: [rollupPreset] })
        ]
      }).then(bundle => {
        this.cacheGlobals[page.context.$PAGE.$name] = bundle;
        globals[page.context.$PAGE.$name] = bundle.generate({format: "iife", exports: "none", sourceMap: true }).code;
      });
    })).then(bundles => {
      return globals;
    });
  }

  async buildCache(cachePath: string, tree: ProjectModel) {
    return Promise.all(
      tree.pages.map((page: PageModel) => {
        const bitPathRegex = new RegExp(".*\/(.*\/.*\.js)$");
        const pageCachePath = join(cachePath, page.context.$PAGE.$name);

        // Concurrency ALL the things!
        return Promise.all([
          // Write all scripts to cache
          Promise.all(page.cache.scripts.map(mat => {
            return sander.copyFile(mat.path)
                         .to(join(pageCachePath, "scripts", mat.overridableName || mat.name || basename(mat.path)));
          })).then(() => {
            // Overwrite scripts with overridable name
            return Promise.all(page.scripts.globals.map(mat => {
              return sander.copyFile(mat.path)
                           .to(join(pageCachePath, "scripts", mat.overridableName || mat.name || basename(mat.path)));
            }));
          }),
          // Write bits
          Promise.all(page.scripts.bits.map(mat => {
            return sander.copyFile(mat)
                         .to(join(pageCachePath, "bits", mat.match(bitPathRegex)[1]));
          }))
        ]);
      })
    );
  }
}