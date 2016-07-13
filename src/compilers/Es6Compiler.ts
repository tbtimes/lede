import * as browserify from 'browserify';
import * as babelify from 'babelify';

import { ProjectReport } from "../interfaces/ProjectReport";
import { globProm } from '../utils';


export class Es6Compiler {
  constructor() {};

  async compile(report: ProjectReport, usedBits) {
    let requireable = await Es6Compiler.getRequirablePaths(`${report.workingDirectory}/.ledeCache/scripts`);
    let globals = await Es6Compiler.bundleGlobals(report, requireable);
    let bits = await Es6Compiler.bundleBits(report, requireable, usedBits);
    return {
      bits,
      globals
    }
  }

  static async bundleBits(report: ProjectReport, requireable, bits) {
    let bitPaths = bits.map(b => `${report.workingDirectory}/.ledeCache/bits/${b}/interact.js`);
    return Es6Compiler.bundleProm(bitPaths, requireable);
    // let bitReturn = {};
    // let bitPaths = bits.map(b => { return {name: b, path: `${report.workingDirectory}/.ledeCache/bits/${b}/interact.js`} });
    // for (let path of bitPaths) {
    //   bitReturn[path.name] = await Es6Compiler.bundleProm(path, requireable);
    // }
    // return bitReturn;
  }
  
  static async bundleGlobals(report: ProjectReport, requireable) {
    let globalPaths = report.scripts.map(s => `${report.workingDirectory}/.ledeCache/scripts/${s}`);
    return await Es6Compiler.bundleProm(globalPaths, requireable);
  }

  static async bundleProm(toAdd, requireable) {
    return new Promise((resolve, reject) => {
      let b = browserify();
      b.require(requireable);
      b.add(toAdd);
      b.transform(babelify, {presets: require('babel-preset-es2015')});
      b.bundle((err, res) => {
        if (err) return reject(err);
        return resolve(res.toString())
      })
    });
  }

  static async getRequirablePaths(searchDir) {
    let paths = [];
    let projects = await globProm(`${searchDir}/*`);
    for (let proj of projects) {
      let projName = proj.split('/')[proj.split('/').length - 1];
      let files = await globProm(`${proj}/*`);
      for (let file of files) {
        let fileName = file.split('/')[file.split('/').length - 1];
        fileName = fileName.split('.').slice(0, fileName.split('.').length - 1).join('.');
        paths.push({
          file,
          expose: `${projName}/${fileName}`
        });
      }
    }
    return paths;
  }
}