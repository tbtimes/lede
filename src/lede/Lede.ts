import { ProjectReport, CompiledPage } from "../interfaces";
import { DependencyAssembler } from "./DependencyAssembler";
import { CacheBuilder } from "./CacheBuilder";


export class Lede {
  dependencyAssembler: DependencyAssembler;

  constructor(public workingDir, public compilers: any, public deployers: any, public logger: any) {
  }

  async deploy(deployer: string, debug = true, pr?: ProjectReport): Promise<ProjectReport> {
    if (!pr) {
      pr = await Lede.assembleDeps(this.workingDir, this.logger);
    }
    if (debug) {
      pr.context.$debug = true;
    }
    await Lede.buildCache(<ProjectReport>pr, this.logger);
    let compiledPage = await Lede.compilePage(this.compilers, pr, this.logger);
    deployer = <any>this.deployers[deployer];
    await Lede.deployPage(deployer, <ProjectReport>pr, compiledPage, this.logger);
    return <ProjectReport>pr;
  }

  static async deployPage(deployer, projReport: ProjectReport, compiledPage: CompiledPage, logger) {
    logger.debug({deployer, projReport, compiledPage});
    logger.info("Deploying project.");
    try {
      await deployer.deploy({report: projReport, compiledPage});
    } catch (e) {
      logger.error({err: e}, "Error deploying project.");
    }
  }

  static async compilePage(compilers, proj: ProjectReport, logger) {
    logger.info("Compiling project.");
    logger.debug({projectReport: proj});
    try {
      return await compilers.html.compile(proj, {css: compilers.css, js: compilers.js});
    } catch (e) {
      logger.error({err: e}, "Error compiling page.");
    }
  }

  static async assembleDeps(workingDir: string, logger): Promise<ProjectReport> {
    try {
      logger.debug({workingDir});
      logger.info("Assembling dependencies");
      let da = new DependencyAssembler(workingDir);
      return await da.assemble();
    } catch (e) {
      logger.error({err: e});
      if (e.code === "CircularDepError") {
        logger.info(`${e.message} depends on a project which depends on itself.`)
      } else if (e.code === "NotAFile") {
        logger.info(`${e.message} is not a file.`)
      }
    }

  }

  static async buildCache(proj: ProjectReport, logger) {
    try {
      logger.info("Caching assets");
      let cb = new CacheBuilder(proj);
      await cb.buildCache();
    } catch (e) {
      logger.error({err: e}, "Error creating cache");
    }
  }

  static async buildProject(logger, projectReport: ProjectReport | string | Promise<ProjectReport>) {
    if (typeof projectReport === "string") {
      projectReport = await Lede.assembleDeps(<string>projectReport, logger);
    }
    await Lede.buildCache(<ProjectReport>projectReport, logger);
  }
}