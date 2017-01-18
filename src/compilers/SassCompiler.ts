import { Logger } from "bunyan";
import { render, Options } from "node-sass";
import { join } from "path";
const sander = require("sander");
const csso = require("csso");

import { MaterialCompiler, PageTree } from "../interfaces";
import { mockLogger } from "../utils";


export class SassCompiler implements MaterialCompiler {
  logger: Logger;
  renderOpts: Options;
  cacheDir: string;

  constructor(arg?) {
    this.logger = arg && arg.logger ? arg.logger : mockLogger;
    this.renderOpts = Object.assign({}, {outputStyle: "compressed", sourceComments: false}, arg && arg.opts ? arg.opts : {});
    this.cacheDir = arg && arg.cacheDir ? arg.cacheDir : ".ledeCache";
  }

  async compile(tree: PageTree): Promise<string> {
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

      // Compress and dedupe css
      const styles = [...bits, ...globals].join("\n");
      // let ast = csso.parse(styles);
      // ast = csso.compress(ast).ast;
      // return csso.translate(ast);
      return styles;
    } catch (err) {
      throw err;
    }
  }

  private compileBits(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    const includePaths = [join(pageCachePath, "styles")];

    return Promise.all(tree.styles.bits.map(mat => {
      return this.renderFile(mat, Object.assign({}, this.renderOpts, {includePaths}));
    }));
  }

  private compileGlobals(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name);
    const includePaths = [join(pageCachePath, "styles")];
    return Promise.all(
      tree.styles.globals.map(mat => {
        return this.renderFile(mat.path, Object.assign({}, this.renderOpts, {includePaths}));
      })
    );
  }

  private renderFile(filePath, opts) {
    opts.file = filePath;
    return new Promise((resolve, reject) => {
      render(opts, (err, res) => {
        if (err) return reject(err);
        return resolve(res.css.toString("utf8"));
      });
    });
  }

  private buildCache(cachePath: string, tree: PageTree) {
    const pageCachePath = join(cachePath, tree.context.$PAGE.$name, "styles");
    return Promise.all(
      tree.styles.cache.map(x => {
        return sander.copyFile(x.path).to(join(pageCachePath, x.overridableName || x.name));
      })
    );
  }
}