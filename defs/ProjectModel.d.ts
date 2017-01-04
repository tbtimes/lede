import { PageSettings, BitSettings, BlockSettings, ProjectSettings, Material, PageTree } from "./interfaces";
export declare class ProjectModel {
    workingDir: string;
    materials: Material[];
    pages: PageSettings[];
    blocks: BlockSettings[];
    bits: BitSettings[];
    project: ProjectSettings;
    constructor(workingDir: string);
    getPageTree({name, debug}: {
        name: string;
        debug?: boolean;
    }): Promise<PageTree>;
    private assembleGlobalMats(mats, type);
    private retrieveMaterial({type, id, overridableName});
    private buildMats({scripts, styles, assets, blocks});
    private getMatCache({styles, scripts});
    private assembleBitMats(blocks);
    private buildContext({page, blocks, debug});
    private parseId(id);
}
