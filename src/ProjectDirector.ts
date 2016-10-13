import { Logger } from "bunyan";

import { Deployer, MaterialCompiler, PageCompiler, CompiledMaterials, ProjectModel, CompiledPage } from "./interfaces";
import { ProjectFactory } from "./ProjectFactory";
import { mockLogger } from "./utils";


export interface ProjectDirectorArgs {
  workingDir: string;
  logger?: Logger;
  projectFactory: ProjectFactory;
  deployer: Deployer;
  styleCompiler: MaterialCompiler;
  scriptCompiler: MaterialCompiler;
  htmlCompiler: PageCompiler;
}

export class ProjectDirector {
  projectFactory: ProjectFactory;
  logger: Logger;
  workingDir: string;
  deployer: Deployer;
  htmlCompiler: PageCompiler;
  styleCompiler: MaterialCompiler;
  scriptCompiler: MaterialCompiler;
  tree: ProjectModel | null;

  constructor({workingDir, logger, projectFactory, deployer, htmlCompiler, styleCompiler, scriptCompiler}: ProjectDirectorArgs) {
    if (!workingDir) throw new Error("workingDir is a required parameter.");
    if (!projectFactory) throw new Error("projectFactory is a required parameter.");
    if (!deployer) throw new Error("A deployer must be specified.");
    if (!styleCompiler) throw new Error("A style compiler must be specified.");
    if (!scriptCompiler) throw new Error("A script compiler must be specified.");
    if (!htmlCompiler) throw new Error("An html compiler must be specified.");
    this.deployer = deployer;
    this.logger = logger || <Logger><any>mockLogger;
    this.workingDir = workingDir;
    this.projectFactory = projectFactory;
    this.scriptCompiler = scriptCompiler;
    this.styleCompiler = styleCompiler;
    this.htmlCompiler = htmlCompiler;

    // Inject logger into delegate components
    this.deployer.configure({logger: this.logger});
    this.projectFactory.configure({logger: this.logger, workingDir: this.workingDir});
  }

  public async compile() {
    let tree: ProjectModel, renderedPages: CompiledPage[];

    this.logger.info("Assembling project dependencies.");
    try {
      tree = await this.projectFactory.getProjectModel();
      this.tree = tree;
    } catch (err) {
      this.logger.error({err}, "There was an error assembling dependencies");
      process.exit(1);
    }

    this.logger.info("Compiling styles and scripts.");
    let [scripts, styles] = <CompiledMaterials[]>(await Promise.all([
      this.scriptCompiler.compile(tree),
      this.styleCompiler.compile(tree)
    ]).catch(err => {
      this.logger.error({err}, "An error occurred while compiling materials.");
      process.exit(1);
    }));

    this.logger.info("Rendering pages.");
    try {
      renderedPages = await this.htmlCompiler.compile({tree, styles, scripts});
    } catch (err) {
      this.logger.error({err}, "An error occurred while rendering the pages.");
      process.exit(1);
    }

    this.logger.info("Deploying pages.");
    try {
      await this.deployer.deploy(renderedPages);
    } catch (err) {
      this.logger.error({err}, "An error occurred while deploying the pages.");
      process.exit(1);
    }
  }

  async refresh(type: string) {
    switch (type) {
      case "scripts":
      case "styles":
      case "assets":
        this.refreshMats();
        break;

      case "bits":
      case "blocks":
      case "pages":
      case "projectSettings":
      case "deps":
        this.compile();
        break;
    }
  }

  async refreshMats() {
    let tree: ProjectModel, renderedPages: CompiledPage[];

    if (!this.tree) {
      this.tree = await this.projectFactory.getProjectModel();
    }
    tree = this.tree;

    this.logger.info("Compiling styles and scripts.");
    let [scripts, styles] = <CompiledMaterials[]>(await Promise.all([
      this.scriptCompiler.compile(tree),
      this.styleCompiler.compile(tree)
    ]).catch(err => {
      this.logger.error({err}, "An error occurred while compiling materials.");
      process.exit(1);
    }));

    this.logger.info("Rendering pages.");
    try {
      renderedPages = await this.htmlCompiler.compile({tree, styles, scripts});
    } catch (err) {
      this.logger.error({err}, "An error occurred while rendering the pages.");
      process.exit(1);
    }

    this.logger.info("Deploying pages.");
    try {
      await this.deployer.deploy(renderedPages);
    } catch (err) {
      this.logger.error({err}, "An error occurred while deploying the pages.");
      process.exit(1);
    }
  };
}