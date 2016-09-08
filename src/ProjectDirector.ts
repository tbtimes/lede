import { Logger } from "bunyan";

import { defaultLogger } from "./DefaultLogger";
import { ProjectReport } from "./models";
import { ProjectFactory } from "./ProjectFactory";


export class ProjectDirector {
  projectFactory: ProjectFactory;
  projectReport: ProjectReport;
  logger: Logger;
  workingDir: string;

  constructor({workingDir, logger, projectFactory}: {workingDir: string, logger: Logger, projectFactory: ProjectFactory}) {
    this.logger = logger || defaultLogger();
    this.workingDir = workingDir || process.cwd();
    this.projectFactory = projectFactory || new ProjectFactory({workingDir: this.workingDir, logger: this.logger});
    this.projectReport = null;
  };

  public async buildReport() {
    this.projectReport = await this.projectFactory.buildReport();
  }

  public async fetchDependencies() {
    // Loop through pages and look for blocks
    // Loop through blocks and look for bits
    // Loop through bits and look for materials
  }

  public async createCache() {

  }

  public async compile() {


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