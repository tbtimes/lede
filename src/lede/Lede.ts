import ContextAssembler from './ContextAssembler';

export default class Lede {
    ctxAssembler: ContextAssembler;
    workingDir: string;
    styleBlock: string;
    contentBlock: string;
    scriptBlock: string;
    
    constructor(wd?: string) {
        this.workingDir = wd ? wd : process.cwd();
        this.ctxAssembler = new ContextAssembler(this.workingDir);
    }
    
    public buildProject() {
        return this.ctxAssembler.assemble()
            .then(ctx => {
                let htmlProm = Lede.buildHtml(ctx);
                htmlProm.then(console.log).catch(console.log);
            })
            .catch(console.log)
    }
    
    private static buildHtml(ctx) {
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