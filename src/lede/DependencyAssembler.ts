import { isUndefined, merge } from 'lodash';
import { stat, Stats } from 'fs-extra';
import { request } from 'https';
import * as aml from 'archieml';

import  { DefaultDependency } from '../models/DefaultDependency';
import { Dependency, ProjectReport } from '../interfaces';
import { CircularDepError } from '../errors';


export class DependencyAssembler {
  constructor(public workingDir) {
  }

  /**
   * This will create and return a ProjectReport
   * @returns {ProjectReport}
   */
  async assemble():Promise<any>/*:ProjectReport */ {
    let deps = await DependencyAssembler.buildDependencies(this.workingDir);
    let context = await DependencyAssembler.buildContext(deps);
    let content = await DependencyAssembler.buildContent(deps);

    return {
      workingDirectory: this.workingDir,
      content,
      context,
      dependencies: deps
    }
  }

  /**
   * This method will build dependencies recursively. ¯\_(ツ)_/¯
   * Not intended to be part of the public interface of DependencyAssembler
   * @param rootDepDir - directory for starting dependency
   * @returns {Dependency[]} - ordered list of dependencies
   */
  static async buildDependencies(rootDepDir:string):Promise<Dependency[]> {
    return await DependencyAssembler.reportOnDep(rootDepDir).then(r => DependencyAssembler.followLeaves(r, [], []))
  }

  /**
   * Generates a report on a dependency and it's child dependencies.
   * @param dir
   * @param calledBy
   * @returns {{node: string, settings: Dependency, leaves: Array}}
   */
  static async reportOnDep(dir:string, calledBy?:string):Promise<{node:string, settings:Dependency, leaves:string[]}> {
    let settings = await DependencyAssembler.gatherSettings(dir);
    let leaves = [];
    for (let proj of settings.dependsOn) {
      leaves.push(`${settings.inheritanceRoot}/${proj}`)
    }
    if (!settings.dependedOnBy) {
      if (calledBy) {
        settings.dependedOnBy = [calledBy]
      } else {
        settings.dependedOnBy = []
      }
    } else {
      settings.dependedOnBy.push(calledBy)
    }
    settings.workingDir = dir;
    return {node: dir, settings, leaves}
  }

  /**
   * This method recursively follows all the child dependencies specified on a node report.
   * @param nodeReport
   * @param settingsArr
   * @param visited
   * @returns {Array<Dependency>}
   */
  static async followLeaves(nodeReport:{node:string, settings:Dependency, leaves:string[]},
                            settingsArr:Array<Dependency>, visited:string[]):Promise<Dependency[]> {
    visited.push(nodeReport.node);
    for (let leaf of nodeReport.leaves) {
      let leafReport = await DependencyAssembler.reportOnDep(leaf, nodeReport.node);
      if (!settingsArr.indexOf(leafReport.settings) > -1) {
        if (visited.indexOf(leafReport.node) > -1) {
          throw new CircularDepError(`${leafReport.node} is relying on a project which has a dependency on itself`);
        }
        settingsArr = await DependencyAssembler.followLeaves(leafReport, settingsArr, visited);
      } else {
        settingsArr[settingsArr.indexOf(leafReport.settings)].dependedOnBy.push(nodeReport.node);
      }
    }
    settingsArr.push(nodeReport.settings);
    return settingsArr
  }

  /**
   * Gathers projectSettings file from specified directory
   * @param dir
   * @returns {Promise<Dependency>}
   */
  static gatherSettings(dir):Promise<Dependency> {
    return new Promise((resolve, reject) => {
      let path = `${dir}/projectSettings.js`;
      stat(path, (err:any, stats:Stats) => {
        if (err && err.code !== 'ENOENT') {
          reject(err);
        }
        if (!err && stats.isFile()) {
          // Here we are importing a user-written module so we want to catch any errors it may throw
          try {
            let SettingsConfig:ObjectConstructor = require(path).default;
            resolve(DependencyAssembler.mergeDepWithDefault(<Dependency>new SettingsConfig()));
          } catch (e) {
            reject(e)
          }
        } else {
          // Could not find any projectSettings, using defaultSettings
          resolve(new DefaultDependency());
        }
      })
    });
  }

  /**
   * This will merge a custom projectSetting with the default
   * @param customSettings
   * @returns {Dependency}
   */
  static mergeDepWithDefault(customSettings:Dependency):Dependency {
    let defaults = new DefaultDependency();
    let merged = Object.assign({}, defaults);

    for (let prop in customSettings) {
      if (defaults.hasOwnProperty(prop)) {
        switch (prop) {

          // Inheritance chain should be concatenated onto the default
          case 'dependsOn':
            merged[prop] = merged[prop].concat(customSettings[prop]);
            break;

          // Should override the default if they exist
          case 'name':
          case 'inheritanceRoot':
          case 'contentResolver':
            if (customSettings[prop]) {
              merged[prop] = customSettings[prop];
            }
            break;
        }
      } else if (customSettings.hasOwnProperty(prop) && !isUndefined(customSettings[prop])) {
        merged[prop] = customSettings[prop];
      }
    }

    return merged;
  }

  /**
   * Grabs context from all dependencies and merges them into one object
   * @param deps
   * @returns {Promise<Any>}
   */
  static async buildContext(deps) {
    let contexts = [];
    for (let dep of deps) {
      let context = await DependencyAssembler.gatherContext(dep.workingDir);
      contexts.push(context);
    }
    return merge(...contexts)
  }

  /**
   * Gathers and returns context object for a dependency
   * @param searchDir
   * @returns {Promise<Any>}
   */
  static gatherContext(searchDir) {
    return new Promise((resolve, reject) => {
      let pathToContext = `${searchDir}/baseContext.js`;
      stat(pathToContext, (err:any, stats:Stats) => {
        if (err) {
          reject(err);
        }
        if (!err && stats.isFile()) {
          // Here we are importing a user-written modules so we want to catch any errors it may throw
          try {
            let Context:ObjectConstructor = require(pathToContext).default;
            resolve(new Context())
          } catch (e) {
            reject(e)
          }
        } else if (!stats.isFile()) {
          reject(new Error(`Expected ${pathToContext} to be a file`))
        }
      })
    });
  }

  /**
   * Gathers and merges content objects from deps if any
   * @param deps
   * @returns {Promise<Any>}
   */
  static async buildContent(deps) {
    let contents = [];
    for (let dep of deps) {
      if (dep.contentResolver) {
        let content = await DependencyAssembler.fetchContent(dep.contentResolver);
        contents.push(content)
      }
    }
    return merge(...contents);
  }

  /**
   * Takes a resolver and returns the content it points to after passing it through the parser function. Defaults to
   * aml parser if none is specified.
   * @param resolver - Dependency content resolver taken from projectSettings.js for a project
   * @returns {Promise<Any>}
   */
  static fetchContent(resolver) {
    return new Promise((resolve, reject) => {
      let options = {
        hostname: 'www.googleapis.com',
        path: `/drive/v2/files/${resolver.fileId}?key=${resolver.apiKey}`,
        method: 'GET'
      };

      request(options, res => {
        let result = "";
        res.on('data', d => result += d);
        res.on('error', e => reject(e));
        res.on('end', () => {
          let parsableResult:any = JSON.parse(result);
          let plainUrl:string = parsableResult.exportLinks['text/plain'].slice(8);
          options.hostname = plainUrl.split('/')[0];
          options.path = `/${plainUrl.split('/').slice(1).join('/')}`;
          request(options, res => {
            parsableResult = "";
            res.on('data', d => parsableResult += d);
            res.on('error', e => reject(e));
            res.on('end', () => {
              if (!resolver.parseFn) {
                resolve(aml.load(parsableResult));
              } else {
                resolve(resolver.parseFn(parsableResult));
              }
            })
          }).end()
        })
      }).end()
    });
  }
}