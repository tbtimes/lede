import { createReadStream } from "fs-extra";
import { render, Options } from "node-sass";
import { join } from 'path';

import { ProjectReport } from "../interfaces/ProjectReport";
import { asyncMap, globProm } from "../utils";


export class SassCompiler {
  options: Options;

  constructor(opts: Options = {}) {
    let defaults: Options = {
      includePaths: [],
      outputStyle: 'compact',
      sourceComments: false,
      sourceMapEmbed: false
    };
    this.options = Object.assign({}, defaults, opts);
  }

  async compile(report: ProjectReport, bits) {
    this.options.includePaths.push(join(report.workingDirectory, '.ledeCache', 'styles'));
    let compiledGlobals = await SassCompiler.compileGlobals(report, Object.assign({}, this.options));
    let compiledBits = await SassCompiler.compileBits(report, Object.assign({}, this.options), bits);
    return {
      globals: compiledGlobals,
      bits: compiledBits
    }
  }

  static async compileBits(report: ProjectReport, options: Options, bits) {
    let bitPaths = bits.map(b => join(report.workingDirectory, '.ledeCache', 'bits', b, 'style.scss'));
    let compiledBits = await asyncMap(bitPaths, async (b) => {
      return await SassCompiler.renderFile(options, b)
    });
    return compiledBits.join('');
  }

  static async compileGlobals(report: ProjectReport, options: Options) {
    let stylesDir = join(report.workingDirectory, '.ledeCache', 'styles');
    let opts = Object.assign({}, options);
    let styleSheets = await asyncMap(report.styles, async(f) => {
      return await SassCompiler.renderFile(opts, join(stylesDir, f))
    });

    return styleSheets.join('');
  }

  static renderFile(options, filePath) {
    let stream = createReadStream(filePath);
    let data = "";
    return new Promise((resolve, reject) => {
      stream.on('data', d => data += d.toString());
      stream.on('end', () => {
        if (!data) {
          return resolve("")
        }
        render(
          {
            data,
            includePaths: options.includePaths,
            outputStyle: options.outputStyle,
            sourceComments: options.sourceComments,
            sourceMapEmbed: options.sourceMapEmbed
          }
          , (err, res) => {
            if (err) {
              return reject(err);
            }
            return resolve(res.css.toString())
          })
      })
    });
  }
}
