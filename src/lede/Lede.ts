import { resolve } from 'path';

import { ProjectReport, Dependency } from '../interfaces';
import { DependencyAssembler } from './DependencyAssembler';
import { CacheBuilder } from './CacheBuilder';


export class Lede {
  constructor(public compilers:any) {
  }

  async buildProject(projectRoot:string): Promise<any> {
    let depAssembler:DependencyAssembler = new DependencyAssembler(projectRoot);
    let projectReport:ProjectReport = await depAssembler.assemble();
    let cacheBuilder:CacheBuilder = new CacheBuilder(projectReport);
    let cachePath:string = await cacheBuilder.buildCache();
    await this.compilers.css.compile(cachePath, resolve(cachePath, '../dist'))
  }
}