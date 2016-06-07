import ContextAssembler from './ContextAssembler';

export default class Lede {
    ctxAssembler: ContextAssembler;
    workingDir: string;
    
    constructor(wd?: string) {
        this.workingDir = wd ? wd : process.cwd();
        this.ctxAssembler = new ContextAssembler(this.workingDir);
    }
    
    public buildHTML() {
        return this.ctxAssembler.assemble()
            .then(ctx => {
                console.log(ctx)
            }) 
            .catch(x => console.log(x))
    }
}

let f = new Lede("/Users/emurray/WebstormProjects/lede/blueprints/project");
f.buildHTML();