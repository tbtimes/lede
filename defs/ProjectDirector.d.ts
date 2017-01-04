import { Logger } from "bunyan";
import { Deployer, MaterialCompiler, PageCompiler } from "./interfaces";
import { ProjectFactory } from "./ProjectFactory";
import { ProjectModel } from "./ProjectModel";
export interface ProjectDirectorArgs {
    workingDir: string;
    logger: Logger;
    depCacheDir: string;
    deployer: Deployer;
    styleCompiler: MaterialCompiler;
    scriptCompiler: MaterialCompiler;
    htmlCompiler: PageCompiler;
    debug: boolean;
}
export declare class ProjectDirector {
    deployer: Deployer;
    logger: Logger;
    workingDir: string;
    projectFactory: ProjectFactory;
    scriptCompiler: MaterialCompiler;
    styleCompiler: MaterialCompiler;
    htmlCompiler: PageCompiler;
    debug: boolean;
    model: ProjectModel;
    constructor({workingDir, logger, depCacheDir, deployer, htmlCompiler, styleCompiler, scriptCompiler, debug}: ProjectDirectorArgs);
    compile(): Promise<void>;
    private deployPages(compiledPages);
    private renderPages(assetTrees);
    private compileMaterials(trees);
    private buildPageTrees();
    private initializeProjectModel();
}
