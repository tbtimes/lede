import { Logger } from "bunyan";

import { defaultLogger } from "./DefaultLogger";
import { ProjectReport } from "./models";
import { ProjectFactory } from "./ProjectFactory";
import { CacheBuilder } from "./CacheBuilder";


export interface ProjectDirectorArgs {
  workingDir: string;
  logger?: Logger;
  projectFactory: ProjectFactory;
  cacheBuilder: CacheBuilder;
}

/**
 * The ProjectDirector is the top level abstraction for working with a project. It is responsible for orchestrating the
 * creation of the models, initiating the retrieval of external assets, triggering the compilation of assets, and launching
 * the deployers.
 */
export class ProjectDirector {
  projectFactory: ProjectFactory;
  cacheBuilder: CacheBuilder;
  logger: Logger;
  workingDir: string;

  constructor({workingDir, logger, projectFactory, cacheBuilder}: ProjectDirectorArgs) {
    if (!workingDir) throw new Error("workingDir is a required parameter");
    if (!projectFactory) throw new Error("projectFactory is a required parameter");
    if (!cacheBuilder) throw new Error("cacheBuilder is a required parameter");
    this.logger = logger || defaultLogger();
    this.workingDir = workingDir;
    this.projectFactory = projectFactory;
    this.cacheBuilder = cacheBuilder;
  };

  public async buildReport(): Promise<ProjectReport> {
    return await this.projectFactory.buildReport();
  }

  public async fetchDependencies() {
    // Loop through pages and look for blocks
    // Loop through blocks and look for bits
    // Loop through bits and look for materials
  }

  public async createCache(report: ProjectReport) {
    await this.cacheBuilder.serialize(report);
  }

  public async compile(report: ProjectReport) {


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