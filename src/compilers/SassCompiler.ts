import { join } from "path";
import { render, Options } from "node-sass";
import { inspect } from "util";
const sander = require("sander");

import { PageTree } from "../ProjectDirector";
import { Compiler } from "../models/Project";
import { Material } from "../models/Material";
import { asyncMap } from "../utils";


export class SassCompiler implements Compiler {
  renderOpts: Options;

  constructor(opts: any) {
    this.renderOpts = Object.assign({}, {outputStyle: "compressed", sourceComments: false}, opts);
  };

  async compile(workingDir: string, tree: PageTree) {
    const cachePath = join(workingDir, ".ledeCache");
    await this.buildCache(cachePath, tree);
    const globals = await this.compileGlobals(cachePath, tree);
    const bits = await this.compileBits(cachePath, tree);
    return { bits, globals };
  }

  async compileGlobals(cachePath, tree) {
    const globals = {};
    for (let page in tree["styles"]) {
      const pageCachePath = join(cachePath, page);
      const includePaths = [join(pageCachePath, "styles")];
      const filesToRender = tree["styles"][page]["globals"].reduce((state: any[], mat: Material) => {
        const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.overridableName);
        if (indexOfPresent < 0) state.push(mat);
        else state[indexOfPresent] = mat;
        return state;
      }, []);
      const renderedGlobals = await asyncMap(filesToRender, async(mat: Material) => {
        return await SassCompiler.renderFile(mat.location, Object.assign({}, this.renderOpts, {includePaths}));
      });
      globals[page] = renderedGlobals.reduce((state, rendered) => {
        return state += rendered.css.toString();
      }, "");
    }
    return globals;
  }

  async compileBits(cachePath, tree) {
    const bits = {};
    for (let page in tree["styles"]) {
      const pageCachePath = join(cachePath, page);
      const includePaths = [join(pageCachePath, "styles")];
      const renderedBits = await asyncMap(tree["styles"][page]["bits"], async(mat: Material) => {
        return await SassCompiler.renderFile(mat.location, Object.assign({}, this.renderOpts, {includePaths}));
      });
      bits[page] = renderedBits.reduce((state, rendered) => {
        return state += rendered.css.toString();
      }, "");
    }
    return bits;
  }

  static renderFile(filePath, opts) {
    opts.file = filePath;
    return new Promise((resolve, reject) => {
      render(opts, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  async buildCache(cachePath: string, tree: PageTree) {
    // console.log(inspect(tree, {depth: Infinity}));
    for (let page in tree.styles) {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.scss)$");
      const pageCachePath = join(cachePath, page);

      await asyncMap(tree["styles"][page].globals, async(mat: Material) => {
        await sander.writeFile(join(pageCachePath, "styles", mat.overridableName), mat.content);
      });
      await asyncMap(tree["styles"][page].bits, async(mat: Material) => {
        await sander.writeFile(join(pageCachePath, "bits", mat.location.match(bitPathRegex)[1]), mat.content);
      });
    }
  }
}