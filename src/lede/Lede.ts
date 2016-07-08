import { resolve } from 'path';

import { ProjectReport } from '../interfaces';
import { DependencyAssembler } from './DependencyAssembler';
import { CacheBuilder } from './CacheBuilder';


export class Lede {
  constructor(public compilers: any) {
  }

  async buildProject(projectRoot: string): Promise<any> {
    let depAssembler: DependencyAssembler = new DependencyAssembler(projectRoot);
    let projectReport: ProjectReport = await depAssembler.assemble();
    let cacheBuilder: CacheBuilder = new CacheBuilder(projectReport);
    await cacheBuilder.buildCache();
    let renderedPage = await this.compilers.html.compile(projectReport, {css: this.compilers.css, js: this.compilers.js});
    // let styles = await this.compilers.css.compile(projectReport);
    // let scripts = await this.compilers.js.compile(projectReport);
    
    return renderedPage;
  }
}