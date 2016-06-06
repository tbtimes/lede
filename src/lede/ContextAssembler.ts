import ProjectAnalyzer from './ProjectAnalyzer';
import { ProjectSettings } from '../interfaces/settings';

class NamespaceErr extends Error {
    name: string;
    message: string;
    stack: any;

    constructor(msg) {
        super();
        this.name = "Namespace Error";
        this.message = msg;
        this.stack = (new Error()).stack;
    }
}

export default class ContextAssembler {
    public projectSettings: ProjectSettings = null;
    public context: Object;
    public includePaths: Array<Array<string>>;

    constructor(public workingDir: string) {};
    
    public assemble() {
        return ProjectAnalyzer.gatherProjSettings(this.workingDir).then(settings => {
            this.projectSettings = settings;
            return settings;
        }).then(settings => {
            let proms = [ProjectAnalyzer.gatherContext(this.workingDir)];
            for (let templateName of settings.inheritanceChain) {
                let path = `${settings.inheritanceRoot}/${templateName}`;
                proms.push(ProjectAnalyzer.gatherContext(path).then( ctx => [templateName, ctx] ));
            }
            return Promise.all(proms)
        }).then(contexts => {
            let mainCtx = contexts.shift();
            this.includePaths = [[`${this.workingDir}`]];
            for (let [contextName, context] of contexts) {
                if (!mainCtx.hasOwnProperty(contextName)) {
                    mainCtx[contextName] = context;
                } else {
                    throw new NamespaceErr(`Cannot load template ${contextName} because a property of that name already exists on base context.`)
                }
                let newIncludePaths = [];
                for (let paths of this.includePaths) {
                    for (let path of paths) {
                        newIncludePaths.push(path);
                    }
                }
                newIncludePaths.push(`${this.projectSettings.inheritanceRoot}/${contextName}`);
                this.includePaths.push(newIncludePaths);
            }
            this.context = mainCtx;
            return this;
        })
    };
}