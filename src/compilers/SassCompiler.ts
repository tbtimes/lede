import { Logger } from "bunyan";
import { render, Options } from "node-sass";
import { join, basename } from "path";
const sander = require("sander");

import { MaterialCompiler, ProjectModel, PageModel } from "../interfaces";
import { mockLogger } from "../utils";
import { SassFailed } from "../errors/CompilerErrors";


export class SassCompiler implements MaterialCompiler {
  logger: Logger;
  renderOpts: Options;
  cacheDir: string;

  constructor(arg?) {
    this.logger = <Logger><any>mockLogger;
    this.renderOpts = Object.assign({}, {outputStyle: "compressed", sourceComments: false}, arg && arg.opts ? arg.opts : {});
    this.cacheDir = arg && arg.cacheDir ? arg.cacheDir : ".ledeCache";
  };

  static renderFile(filePath, opts) {
    opts.file = filePath;
    return new Promise((resolve, reject) => {
      render(opts, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  configure({ logger }) {
    this.logger = logger;
  }

  async compile(tree: ProjectModel) {
    const cachePath = join(tree.workingDir, this.cacheDir);
    let globals, bits;

    try {
      await this.buildCache(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while caching styles");
      throw new SassFailed({detail: err});
    }
    try {
      globals = await this.compileGlobals(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling global styles");
      throw new SassFailed({detail: err});
    }
    try {
      bits = await this.compileBits(cachePath, tree);
    } catch (err) {
      this.logger.error({err}, "An error occurred while compiling bit styles");
      throw new SassFailed({detail: err});
    }

    return { bits, globals };
  };

  async compileBits(cachePath: string, tree: ProjectModel) {
    const bits = {};
    return Promise.all(tree.pages.map(page => {
      const pageCachePath = join(cachePath, page.context.$PAGE.$name);
      const includePaths = [join(pageCachePath, "styles")];
      return Promise.all(page.styles.bits.map(mat => {
        return SassCompiler.renderFile(mat, Object.assign({}, this.renderOpts, {includePaths}));
      })).then(renderedBits => {
        bits[page.context.$PAGE.$name] = renderedBits.reduce((state, rendered: { css: Buffer }) => {
          return state + rendered.css.toString();
        }, "");
      });
    })).then(() => {
      return bits;
    });
  }

  async compileGlobals(cachePath: string, tree: ProjectModel) {
    const globals = {};
    return Promise.all(tree.pages.map(page => {
      const pageCachePath = join(cachePath, page.context.$PAGE.$name);
      const includePaths = [join(pageCachePath, "styles")];
      return Promise.all(page.styles.globals.map(mat => {
        return SassCompiler.renderFile(mat.path, Object.assign({}, this.renderOpts, {includePaths}));
      })).then(renderedGlobals => {
        globals[page.context.$PAGE.$name] = renderedGlobals.reduce((state, rendered: { css: Buffer }) => {
          return state + rendered.css.toString();
        }, "");
      });
    })).then(() => {
      return globals;
    });
  }

  async buildCache(cachePath: string, tree: ProjectModel) {
    tree.pages.forEach((page: PageModel) => {
      const bitPathRegex = new RegExp(".*\/(.*\/.*\.scss)$");
      const pageCachePath = join(cachePath, page.context.$PAGE.$name);

      return Promise.all([
        Promise.all(page.cache.styles.map(mat => {
          return sander.copyFile(mat.path)
            .to(join(pageCachePath, "styles", mat.overridableName || mat.name || basename(mat.path)));
        })).then(() => {
          return Promise.all(page.styles.globals.map(mat => {
            return sander.copyFile(mat.path)
              .to(join(pageCachePath, "styles", mat.overridableName || mat.name || basename(mat.path)));
          }));
        }),
        Promise.all(page.styles.bits.map(mat => {
          return sander.copyFile(mat)
            .to(join(pageCachePath, "bits", mat.match(bitPathRegex)[1]));
        }))
      ]);
    });
  }
}