import { Logger } from "bunyan";
import { join } from "path";
const sander = require("sander");

import { defaultLogger } from "./DefaultLogger";
import { ProjectReport } from "./models";
import { ProjectFactory } from "./ProjectFactory";


export interface ProjectDirectorArgs {
  workingDir: string;
  logger?: Logger;
  projectFactory: ProjectFactory;
}

/**
 * The ProjectDirector is the top level abstraction for working with a project. It is responsible for orchestrating the
 * creation of the models, initiating the retrieval of external assets, triggering the compilation of assets, and launching
 * the deployers.
 */
export class ProjectDirector {
  projectFactory: ProjectFactory;
  logger: Logger;
  workingDir: string;

  constructor({workingDir, logger, projectFactory}: ProjectDirectorArgs) {
    if (!workingDir) throw new Error("workingDir is a required parameter");
    if (!projectFactory) throw new Error("projectFactory is a required parameter");
    this.logger = logger || defaultLogger();
    this.workingDir = workingDir;
    this.projectFactory = projectFactory;
  };

  public async buildReport(): Promise<ProjectReport> {
    return await this.projectFactory.buildReport();
  }

  public async fetchDependencies() {
    // Loop through pages and look for blocks
    // Loop through blocks and look for bits
    // Loop through bits and look for materials
  }

  // public async buildCache(report: ProjectReport): Promise<any> {
  //   const cacheReport = {};
  //   for (let page of report.pages) {
  //     const cacheDir = join(this.workingDir, ".ledeCache", page.name);
  //     cacheReport[page.name] = {};
  //     for (let type of Object.keys(page.materials)) {
  //       const cachePath = join(cacheDir, type);
  //       cacheReport[page.name][type] = {};
  //       const toWrite = page.materials[type].reduce((state: any, mat: Material) => {
  //         state[mat.overridableName] = mat.content;
  //         cacheReport[page.name][type][mat.overridableName] = join(cachePath, mat.overridableName);
  //         return state;
  //       }, {});
  //       for (let file of Object.keys(toWrite)) {
  //         await sander.writeFile(join(cachePath, file), toWrite[file]);
  //       }
  //     }
  //   }
  //   return cacheReport;
  // }

  public async compile(report: ProjectReport) {

    await report.project.compilers.script.compile(report);
    // Set up compilers
        // let styleCompiler = this.projectReport.project.compilers.style;
        // let scriptCompiler = this.projectReport.project.compilers.script;
        // let htmlCompiler = this.projectReport.project.compilers.script;
        // styleCompiler = new styleCompiler.compilerClass(styleCompiler.constructorArg);
        // scriptCompiler = new scriptCompiler.compilerClass(scriptCompiler.constructorArg);
        // htmlCompiler = new htmlCompiler.compilerClass(htmlCompiler.constructorArg);
    // Compile styles and scripts
    // Compile html
  };
}