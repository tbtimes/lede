import { inspect } from "util";
import { join } from "path";
const sander = require("sander");

import { ProjectReport } from "../models/Project";
import { Material } from "../models/Material";
import { Block } from "../models/Block";
import { Page } from "../models/Page";
import { BitReference, Bit } from "../models/Bit";
import { asyncMap } from "../utils";


// Rollup stuffs
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const multientry = require("rollup-plugin-multi-entry");
const nodeResolve = require("rollup-plugin-node-resolve");
const rollupPreset = require("babel-preset-es2015-rollup");
const includes = require("rollup-plugin-includepaths");


export interface PageTree {
  [pageName: string]: { globals: Material[], bits: Material[] };
}

export class Es6Compiler {
  cacheBits: any;
  cacheGlobals: any;

  constructor(opts: any) {
    this.cacheBits = {};
    this.cacheGlobals = {};
  };

  async compile(report: ProjectReport) {
    const cachePath = join(report.workingDir, ".ledeCache");
    const pageTree = await this.buildPageTree(report);
    await this.buildCache(cachePath, pageTree);
    // console.log(inspect(pageTree, {depth: Infinity}));
    // console.log(inspect(cache, {depth: Infinity}));
    // Compile globals
    // Compile bits
    const globals = await this.compileGlobals(cachePath, pageTree);
    const bits = await this.compileBits(cachePath, pageTree);
    return {bits, globals};
  };

  async compileGlobals(cachePath: string, pageTree: PageTree) {
    const globals = {};
    for (let page in pageTree) {
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
    for (let page in pageTree) {
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
    for (let page in pageTree) {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.js)$");
      const pageCachePath = join(cachePath, page);

      await asyncMap(pageTree[page].globals, async (mat: Material) => {
        await sander.writeFile(join(pageCachePath, "scripts", mat.overridableName), mat.content);
      });
      await asyncMap(pageTree[page].bits, async (mat: Material) => {
        await sander.writeFile(join(pageCachePath, "bits", mat.location.match(bitPathRegex)[1]), mat.content);
      });
    }
  }

  async buildPageTree(report: ProjectReport): Promise<PageTree> {
    return report["pages"].reduce((state: any, p: Page) => {
      state[p.name] = {};
      state[p.name].globals = p.materials.scripts;

      // This next part is a little sticky. First we loop through the Page's blocks list to find the name of the blocks
      // that are included on the Page. We use that name to find the full block object from the ProjectReport's blocks.
      // Then we loop over that block's bits to find references to every bit it needs to work. We use the bit references to find
      // the actual bits from the ProjectReport's bits and then return each included bit's script material. The result is
      // that we get an array of arrays of script materials that need to be put on the page.
      const bitsWithDupes = p.blocks.map((blockName: string) => {
        return report["blocks"]
          .find((block: Block) => block.name === blockName).bits
          .map((bitref: BitReference) => {
            return report["bits"]
              .find((bit: Bit) => bit.name === bitref.bit).script;
          });
      });

      // Here we just flatten and dedupe the above array by using a set
      state[p.name].bits = [...new Set(...bitsWithDupes)];
      return state;
    }, {});
  }
}