import { createReadStream } from 'fs';
import { render, Options } from 'node-sass';
import { globProm } from '../utils';


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

  async compile(cacheDir: string, outputDir: string) {
    await this.setIncludes(cacheDir);
  }

  async setIncludes(dir) {
    let bits = await globProm(`${dir}/bits/*`);
    this.options.includePaths.push(`${dir}/styles`);
    for (let bit of bits) {
      this.options.includePaths.push(bit);
    }
    console.log(this.options.includePaths)
  }
}