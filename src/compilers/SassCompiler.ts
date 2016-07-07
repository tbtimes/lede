import { createReadStream } from 'fs-extra';
import { render, Options } from 'node-sass';

import { ProjectReport } from "../interfaces/ProjectReport";
import { asyncMap, globProm, readJsonProm } from '../utils';


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
  
  async compile(report: ProjectReport) {
    let globals = await SassCompiler.compileGlobals(report, Object.assign({}, this.options));
    let bits = await SassCompiler.compileBits(report, Object.assign({}, this.options));
    
    return {
      globals,
      bits
    }
  }
  
  static async compileBits(report: ProjectReport, options: Options) {
    let projDirs = await globProm(`${report.workingDirectory}/.ledeCache/bits/*`);
    let bitsReturn = {};
    for (let proj of projDirs) {
      let projName = proj.split('/')[proj.split('/').length - 1];
      let bits = await globProm(`${proj}/*`);
      for (let bit of bits) {
        let bitName = bit.split('/')[bit.split('/').length - 1];
        let cfg = await readJsonProm(`${bit}/bitConfig.json`);
        let pathToRender = `${bit}/${cfg.style}`;
        bitsReturn[`${projName}/${bitName}`] = await SassCompiler.renderFile(options, pathToRender);
      }
    }
    return bitsReturn;
  }

  static async compileGlobals(report: ProjectReport, options: Options) {
    let stylesDir = `${report.workingDirectory}/.ledeCache/styles`;
    let opts = Object.assign({}, options);
    opts.includePaths.push(stylesDir);
    
    let styleSheets = await asyncMap(report.styles, async (f) => {
      return await SassCompiler.renderFile(opts, `${stylesDir}/${f}`)
    });
    
    return styleSheets.join('');
  }
  
  static renderFile(options, filePath) {
    let stream = createReadStream(filePath);
    let data = "";
    return new Promise((resolve, reject) => {
      stream.on('data', d => data += d.toString());
      stream.on('end', () => {
        render(
          {
            data,
            includePaths: options.includePaths,
            outputStyle: options.outputStyle,
            sourceComments: options.sourceComments,
            sourceMapEmbed: options.sourceMapEmbed
          }
          ,(err, res) => {
          if (err) reject(err);
          resolve(res.css.toString())
        })
      })
    });
  }
}