import { resolve } from 'path';

import { ProjectReport, CompiledPage } from '../interfaces';
import { DependencyAssembler } from './DependencyAssembler';
import { CacheBuilder } from './CacheBuilder';
import { FileSystemDeployer } from "../deployers/FileSystemDeployer";


export class Lede {
  dependencyAssembler: DependencyAssembler;

  constructor(public workingDir, public compilers: any, public deployers: any, public logger: any) {
  }

  static async deployPage(deployPath: string, projReport: ProjectReport, compiledPage: CompiledPage, logger) {
    logger.info({ deployPath, projReport, compiledPage }, "Deploying project.");
    try {
      let deployer = new FileSystemDeployer(deployPath);
      await deployer.deploy({report: projReport, compiledPage});
    } catch(e) {
      logger.error({err: e}, "Error deploying project.");
    }
  }

  static async compilePage(compilers, proj: ProjectReport, logger): CompiledPage {
    logger.info({ projectReport: proj}, "Compiling project.");
    try {
      return compilers.html.compile(proj, { css: compilers.css, js: compilers.js });
    } catch(e) {
      logger.error({err: e}, "Error compiling page.");
    }
  }

  static async getProjectReport(workingDir: string, logger) {
    try {
      logger.info({ workingDir }, "Assembling dependencies");
      let da = new DependencyAssembler(workingDir);
      return da.assemble();
    } catch(e) {
      logger.error({ err: e});
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
    } catch(e) {
      logger.error({err: e}, "Error creating cache");
    }
  }

  static async buildProject(logger, projectReport: ProjectReport | string) {
    if (typeof projectReport === "string") {
      projectReport = <any>await Lede.getProjectReport(<string>projectReport, logger);
    }
    await Lede.buildCache(<ProjectReport>projectReport, logger);
  }






  // async function buildFromGroundUp(buildPath, servePath, port) {
  // try {
  //   let depAssembler = new DependencyAssembler(buildPath);
  //   let pr = await assembleDeps(depAssembler);
  //   await buildCache(pr);
  //   let compiledPage = await compilePage(pr);
  //   await servePage(servePath, port, pr, compiledPage);
  //   await createWatcher(pr, servePath, port, buildPath);
  // } catch(e) {
  //   console.log(e);
  // }

  // async compileProject(projectRoot: string): Promise<{report: ProjectReport, compiledPage: CompiledPage}> {
  //   let depAssembler: DependencyAssembler = new DependencyAssembler(projectRoot);
  //   let projectReport: ProjectReport = await depAssembler.assemble();
  //   let cacheBuilder: CacheBuilder = new CacheBuilder(projectReport);
  //   await cacheBuilder.buildCache();
  //   let compiledPage = await this.compilers.html.compile(projectReport, {css: this.compilers.css, js: this.compilers.js});
  //
  //   return {
  //     report: projectReport,
  //     compiledPage,
  //     cachePath: `${projectRoot}/.ledeCache`
  //   };
  // }
  //
  // async deployProject(projectRoot: string, deployer: {deploy: (CompiledPage) => Promise<any>}): Promise<any> {
  //   let compiledProject = await this.compileProject(projectRoot);
  //   await deployer.deploy(compiledProject);
  //   return true;
  // }
  //
  // async compileWindows(projectRoot: string): Promise<{report: ProjectReport, compiledPage: CompiledPage}> {
  //
  // }
}