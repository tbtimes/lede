import { resolve } from 'path';

import { ProjectReport, CompiledPage } from '../interfaces';
import { DependencyAssembler } from './DependencyAssembler';
import { CacheBuilder } from './CacheBuilder';


export class Lede {
  constructor(public compilers: any) {
  }

  async compileProject(projectRoot: string): Promise<{report: ProjectReport, compiledPage: CompiledPage}> {
    let depAssembler: DependencyAssembler = new DependencyAssembler(projectRoot);
    let projectReport: ProjectReport = await depAssembler.assemble();
    let cacheBuilder: CacheBuilder = new CacheBuilder(projectReport);
    await cacheBuilder.buildCache();
    let compiledPage = await this.compilers.html.compile(projectReport, {css: this.compilers.css, js: this.compilers.js});
    
    return {
      report: projectReport,
      compiledPage,
      cachePath: `${projectRoot}/.ledeCache`
    };
  }

  async deployProject(projectRoot: string, deployer: {deploy: (CompiledPage) => Promise<any>}): Promise<any> {
    let compiledProject = await this.compileProject(projectRoot);
    await deployer.deploy(compiledProject);
    return true;
  }
}