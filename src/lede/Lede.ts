import ContextAssembler from './ContextAssembler';
import CacheBuilder from "./CacheBuilder";
import * as fs from 'fs-extra'

export default class Lede {
    ctxAssembler: ContextAssembler;
    workingDir: string;
    cacheBuilder: CacheBuilder;
    
    constructor(wd?: string) {
        this.workingDir = wd ? wd : process.cwd();
        this.ctxAssembler = new ContextAssembler(this.workingDir);
        this.cacheBuilder = new CacheBuilder(this.workingDir)
    }
    
    public async buildProject() {
        let projReport = await this.ctxAssembler.assemble();
        fs.writeJSON(`${__dirname}/context.json`, projReport)
        await this.cacheBuilder.assemble(projReport);
        
        // console.log(projReport)
    }
}

let f = new Lede("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/sample-project")
f.buildProject().catch(console.log);