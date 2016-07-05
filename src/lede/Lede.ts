import { ProjectReport, Dependency } from '../interfaces';
import { DependencyAssembler } from './DependencyAssembler';
import { CacheBuilder } from './CacheBuilder';


export class Lede {
  constructor(public compilers:any, public deployer:any) {
  }

  async buildProject(projectRoot:string):any /*ProjectReport*/ {
    let depAssembler = new DependencyAssembler(projectRoot);
    let projectReport = await depAssembler.assemble();
    let cacheBuilder = new CacheBuilder(projectReport);
  }
}

let l = new Lede({}, {});
l.buildProject("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/sample-project");