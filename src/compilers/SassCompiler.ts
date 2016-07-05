import { createReadStream } from 'fs';
import { render, Options } from 'node-sass';


export class SassCompiler {
  options:Options;

  constructor(opts: Options = {}) {
    let defaults: Options = {
      includePaths: [],
      outputStyle: 'compact',
      sourceComments: false,
      sourceMapEmbed: false
    };
    this.options = Object.assign({}, defaults, opts);
  }

  compile(cacheDir:string, outputDir:string) {
    console.log(cacheDir)
    console.log(outputDir)
  }
}