import ContextAssembler from './ContextAssembler';
import BitAssembler from "./BitAssembler";

export default class Lede {
    ctxAssembler: ContextAssembler;
    workingDir: string;
    bitAssembler: BitAssembler;
    
    constructor(wd?: string) {
        this.workingDir = wd ? wd : process.cwd();
        this.ctxAssembler = new ContextAssembler(this.workingDir);
        this.bitAssembler = new BitAssembler(this.workingDir)
    }
    
    public buildProject() {
        // return this.ctxAssembler.assemble()
        //     .then(ctx => {
        //         Lede.compileBits(ctx);
        //     })
        //     .catch(console.log)
        
        this.ctxAssembler.assemble().then(projReport => this.bitAssembler.assemble(projReport))
    }
    
    public static compileBits(ctx) {
        return new Promise((resolve, reject) => {
            for (let project of ctx.includePaths) {
                let styleCompiler = project.settings.CSSPreprocessor;
                styleCompiler.makeBits(project)
            }
        });
    }
    
    public static buildStyles(ctx) {
        return new Promise((resolve, reject) => {
            let proms = [];
            for (let project of ctx.includePaths) {
                let styleCompiler = project.settings.CSSPreprocessor;
                styleCompiler.configure(ctx.includePaths.indexOf(project), ctx.includePaths);
                resolve()
            }
        });
    }
    
    public static buildHtml(ctx) {
        return new Promise((resolve, reject) => {
            let templateAssembler = ctx.projectSettings.HtmlTemplateAssembler
                .configure(ctx.includePaths.map(ctx.projectSettings.inheritancePathMap.html))
                .renderTemplate(ctx)
                .then(resolve)
                .catch(reject)
        });
    }
    
    private static buildHtmlBlocks(ctx) {
        
    }
}

let f = new Lede("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/sample-project")
f.buildProject();