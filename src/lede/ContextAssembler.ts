import ProjectAnalyzer from './ProjectAnalyzer';
import { ProjectSettings } from '../interfaces/settings'

export default class ContextAssembler {
    public projectSettings: ProjectSettings = null;
    public orderedContextObjects: Array<Object> = [];

    constructor(public workingDir: string) {};
    
    public assemble() {
        return ProjectAnalyzer.gatherProjSettings(this.workingDir).then(settings => {
            this.projectSettings = settings;
            return settings;
        }).then(settings => {
            let proms = [ProjectAnalyzer.gatherContext(this.workingDir)];
            for (let inheritedContextPath of settings.inheritanceChain) {
                let path = `${settings.inheritanceRoot}/${inheritedContextPath}`;
                proms.push(ProjectAnalyzer.gatherContext(path));
            }
            return Promise.all(proms)
        }).then(contexts => {
            this.orderedContextObjects = this.orderedContextObjects.concat(contexts);
            return this
        })
    };
    
}

let f = new ContextAssembler("/Users/emurray/WebstormProjects/lede/spec/stubs/test-proj");
f.assemble();