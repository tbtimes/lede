import * as browserify from "browserify";
import * as babelify from "babelify";
import { basename, resolve } from "path";
import * as glob from "glob";
import { ProjectReport } from "../interfaces/ProjectReport";


function globProm(path, cwd?): Promise<Array<string>> {
  return new Promise((resolve, reject) => {
    glob(path, {
      cwd: cwd ? cwd: process.cwd()
    }, (err, paths) => {
      if (err) {
        return reject(err);
      }
      return resolve(paths);
    })
  });
}


export default class Es6Compiler {
  constructor(public options) {};

  async compile(report: ProjectReport, usedBits) {
    let requireable = await Es6Compiler.getRequirablePaths(resolve(report.workingDirectory, ".ledeCache", "scripts"));
    let globals = await Es6Compiler.bundleGlobals(report, requireable);
    let bits = await Es6Compiler.bundleBits(report, requireable, usedBits);
    return {
      bits,
      globals
    }
  }

  static async bundleBits(report: ProjectReport, requireable, bits) {
    let bitPaths = bits.map(b => resolve(report.workingDirectory, ".ledeCache", "bits", b, "interact.js"));
    return Es6Compiler.bundleProm(bitPaths, requireable, resolve(report.workingDirectory, ".ledeCache", "scripts"), report.context.$debug);
  }
  
  static async bundleGlobals(report: ProjectReport, requireable) {
    let globalPaths = report.scripts.map(s => resolve(report.workingDirectory, ".ledeCache", "scripts", s));
    return await Es6Compiler.bundleProm(globalPaths, requireable, resolve(report.workingDirectory, ".ledeCache", "scripts"), report.context.$debug);
  }

  static async bundleProm(toAdd, requireable, cwd, debug) {
    return new Promise((resolve, reject) => {
      let b = browserify({basedir: cwd, debug: debug});
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
    let projects = await globProm(`*`, searchDir);
    for (let proj of projects) {
      let projName = basename(proj);
      let files = await globProm(`*`, resolve(searchDir, proj));
      for (let file of files) {
        let fileName = basename(file);
        paths.push({
          file: resolve(searchDir, projName, fileName),
          expose: `${projName}/${fileName}`
        });
      }
    }
    return paths;
  }
}