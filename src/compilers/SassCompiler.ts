import { join, basename } from "path";
import { render, Options } from "node-sass";
const sander = require("sander");
import { Logger } from "bunyan";

import { PageTree } from "../interfaces/PageTree";
import { Compiler } from "../interfaces/Compiler";
import { Material } from "../models/Material";
import { asyncMap } from "../utils";
import { mockLogger } from "../DefaultLogger";


export class SassCompiler implements Compiler {
  renderOpts: Options;
  logger: Logger;

  constructor(opts: any) {
    this.renderOpts = Object.assign({}, {outputStyle: "compressed", sourceComments: false}, opts);
    this.logger = <any>mockLogger();
  };

  configure({ logger }) {
    this.logger = logger;
  }

  async compile(tree: PageTree) {
    const cachePath = join(tree.workingDir, ".ledeCache");
    let globals, bits;

    try {
      await this.buildCache(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while caching styles");
    }

    try {
      globals = await this.compileGlobals(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling global styles");
    }

    try {
      bits = await this.compileBits(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling bit styles");
    }

    return { bits, globals };
  }

  async compileGlobals(cachePath, tree) {
    const globals = {};
    for (let page of tree.pages) {
      const pageCachePath = join(cachePath, page.name);
      const includePaths = [join(pageCachePath, "styles")];
      const renderedGlobals = await asyncMap(page.styles.globals, async(mat: Material) => {
        return await SassCompiler.renderFile(mat.location, Object.assign({}, this.renderOpts, {includePaths}));
      });
      globals[page.name] = renderedGlobals.reduce((state, rendered) => {
        return state += rendered.css.toString();
      }, "");
    }
    return globals;
  }

  async compileBits(cachePath, tree) {
    const bits = {};
    for (let page of tree.pages) {
      const pageCachePath = join(cachePath, page.name);
      const includePaths = [join(pageCachePath, "styles")];
      const renderedBits = await asyncMap(page.styles.bits, async(mat: Material) => {
        return await SassCompiler.renderFile(mat.location, Object.assign({}, this.renderOpts, {includePaths}));
      });
      bits[page.name] = renderedBits.reduce((state, rendered) => {
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
    for (let page of tree.pages) {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.scss)$");
      const pageCachePath = join(cachePath, page.name);

      await Promise.all(page.cache.styles.map(mat => {
        return sander.writeFile(join(pageCachePath, "styles", mat.overridableName || mat.name || basename(mat.location)), mat.content);
      }));

      await Promise.all(page.styles.globals.map(mat => {
        return sander.writeFile(join(pageCachePath, "styles", mat.overridableName || mat.name || basename(mat.location)), mat.content);
      }));

      await Promise.all(page.styles.bits.map(mat => {
        return sander.writeFile(join(pageCachePath, "bits", mat.location.match(bitPathRegex)[1]), mat.content);
      }));
    }
  }
}