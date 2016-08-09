import { merge } from "lodash";
import { stat, Stats } from "fs-extra";
import { request } from "https";
import { resolve as presolve } from "path";
import { homedir } from "os";
import { Dependency, ProjectReport, ContentResolver } from "../interfaces";
import { CircularDepError, NotAFile } from "../errors";

declare module aml {
  export function load(input: string): any;
}


interface NodeReport {
  node: string;
  settings: Dependency;
  leaves: string[];
}


export class DependencyAssembler {
  constructor(public workingDir: string) {
  }

  /**
   * This will fetch all project dependencies, merge all baseContexts and fetch, parse, and merge all googleapis
   * content.
   * @returns {Promise<ProjectReport>}
   */
  public async assemble(): Promise<ProjectReport> {
    let deps = await DependencyAssembler.buildDependencies(this.workingDir);
    let origDep = deps[deps.length - 1];
    let context = merge(await DependencyAssembler.buildContext(deps),
      {content: await DependencyAssembler.buildContent(deps)},
      {$projectName: origDep.name});


    return {
      workingDirectory: this.workingDir,
      context,
      dependencies: deps,
      styles: origDep.styles,
      scripts: origDep.scripts,
      blocks: origDep.blocks
    }
  }

  /**
   * This method takes a rootDepDir string and returns a promise containing an ordered array of dependencies. Deps[0]
   * is the most-basic dependency; Deps[Deps.length - 1] is the project in rootDepDir.
   * @param rootDepDir - directory for starting dependency
   * @returns {Promise<Dependency[]>} - ordered list of dependencies
   */
  public static async buildDependencies(rootDepDir: string): Promise<Dependency[]> {
    return await DependencyAssembler.reportOnDep(rootDepDir).then(r => DependencyAssembler.followLeaves(r, [], []))
  }

  /**
   * Generates a Node on the dependency tree.
   * @param dir
   * @param calledBy
   * @returns {Promise<NodeReport>}
   */
  private static async reportOnDep(dir: string): Promise<NodeReport> {
    let settings = await DependencyAssembler.gatherSettings(dir);
    let leaves = [];
    for (let proj of settings.dependsOn) {
      leaves.push(presolve(settings.inheritanceRoot, proj))
    }
    settings.workingDir = dir;
    return {node: dir, settings, leaves}
  }

  /**
   * This method creates an ordered array of dependencies by following the specified node all the way to it's root
   * @param nodeReport
   * @param settingsArr
   * @param visited
   * @throws CircularDepError - thrown when a $currNode has a dependency on a node that depends on $currNode
   * @returns {Array<Dependency>}
   */
  private static async followLeaves(nodeReport: NodeReport, settingsArr: Array<Dependency>,
                                    visited: string[]): Promise<Dependency[]> {
    visited.push(nodeReport.node);
    for (let leaf of nodeReport.leaves) {
      let leafReport = await DependencyAssembler.reportOnDep(leaf);
      if (!(settingsArr.map(x => x.name).indexOf(leafReport.settings.name) > -1)) {
        if (visited.indexOf(leafReport.node) > -1) {
          throw new CircularDepError(leafReport.node)
        }
        settingsArr = await DependencyAssembler.followLeaves(leafReport, settingsArr, visited);
      }
    }
    settingsArr.push(nodeReport.settings);
    return settingsArr;
  }

  /**
   * Gathers projectSettings file from specified directory and initializes then merges with default
   * @param dir
   * @returns {Promise<Dependency>}
   */
  public static gatherSettings(dir): Promise<Dependency> {
    return new Promise((resolve, reject) => {
      let path = presolve(dir, 'projectSettings.js');
      stat(path, (err: any, stats: Stats) => {
        if ((err && err.code === 'ENOENT') || !stats.isFile()) {
          return reject(new NotAFile(path));
        } else if (err) {
          return reject(err)
        } else {
          // Here we are importing a user-written module so we want to catch any errors it may throw
          try {
            let SettingsConfig: ObjectConstructor = require(path).default;
            let settings: Dependency = <any>new SettingsConfig();

            return resolve(DependencyAssembler.setDepDefaults(settings));
          } catch (e) {
            return reject(e)
          }
        }
      })
    });
  }

  public static setDepDefaults(settings: Dependency) {
    if (!settings.inheritanceRoot) {
      settings.inheritanceRoot = process.env.LEDE_HOME ? presolve(homedir(), process.env.LEDE_HOME) : presolve(
        homedir(), "LedeProjects");
    }
    if (!settings.blocks) {
      settings.blocks = ["ARTICLE"];
    }
    if (!settings.scripts) {
      settings.scripts = [];
    }
    if (!settings.styles) {
      settings.styles = [];
    }
    if (!settings.name) {
      settings.name = "defaultLedeProject";
    }
    if (!settings.assets) {
      settings.assets = [];
    }
    if (!settings.googleFileId) {
      settings.googleFileId = "";
    }
    if (!settings.dependsOn) {
      settings.dependsOn = [];
    }
    return settings;
  }

  /**
   * Takes and array of dependencies, gathers baseContext (if any), and then merges child contexts onto root context.
   * @param deps
   * @returns {Promise<any>}
   */
  public static async buildContext(deps: Array<Dependency>): Promise<any> {
    let contexts = [];
    for (let dep of deps) {
      try {
        let context = await DependencyAssembler.gatherContext(dep.workingDir);
        contexts.push(context);
      } catch (e) {
        if (e.code === 'NotAFile') {
          // Here would be a good time to use an event emitter or logger
        } else {
          throw e;
        }
      }

    }
    return merge(...contexts)
  }

  /**
   * Looks for and resolves a baseContext.js file if it exists in the directory. If ENOENT, resolves with an empty
   * object.
   * @param searchDir
   * @returns {Promise<any>}
   */
  public static gatherContext(searchDir: string): Promise<any> {
    return new Promise((resolve, reject) => {
      let pathToContext = presolve(searchDir, 'baseContext.js');
      stat(pathToContext, (err: any, stats: Stats) => {
        if (err && err.code === 'ENOENT') {
          return resolve({});
        } else if (err) {
          return reject(err);
        } else if (!err && stats.isFile()) {
          // Here we are importing a user-written modules so we want to catch any errors it may throw
          try {
            let Context: ObjectConstructor = require(pathToContext).default;
            return resolve(new Context())
          } catch (e) {
            return reject(e)
          }
        } else if (!stats.isFile()) {
          return reject(new NotAFile(pathToContext))
        }
      })
    });
  }

  /**
   * Gathers and merges content objects from deps if any
   * @param deps
   * @returns {Promise<Any>}
   */
  public static async buildContent(deps: Dependency[]): Promise<any> {
    let contents = [];
    for (let dep of deps) {
      if (dep.googleFileId) {
        if (!process.env.GAPI_KEY) {
          throw new Error("Must have a googleapis key saved in the env variable GAPI_KEY to access documents stored on google drive.")
        }
        let content = await DependencyAssembler.fetchContent(
          {fileId: dep.googleFileId, apiKey: process.env.GAPI_KEY, parseFn: null});
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
  public static fetchContent(resolver: ContentResolver): Promise<any> {
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
          let parsableResult: {exportLinks: string} = JSON.parse(result);
          let plainUrl: string = parsableResult.exportLinks['text/plain'].slice(8);
          options.hostname = plainUrl.split('/')[0];
          options.path = `/${plainUrl.split('/').slice(1).join('/')}`;
          request(options, res => {
            let parsableResult = "";
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