import { Logger } from "bunyan";
import { ProjectModel } from "./ProjectModel";
import { BitSettings, BlockSettings, PageSettings, ProjectSettings, Material } from "./interfaces";
export declare enum SettingsType {
    Project = 0,
    Page = 1,
    Bit = 2,
    Block = 3,
}
export declare type SETTINGS = BitSettings | BlockSettings | PageSettings | ProjectSettings;
export interface Mats {
    scripts: Material[];
    styles: Material[];
    assets: Material[];
}
export declare class ProjectFactory {
    logger: Logger;
    workingDir: string;
    depCache: string;
    constructor({workingDir, depCacheDir, logger}: {
        workingDir: string;
        depCacheDir: string;
        logger: Logger;
    });
    getProject(): Promise<ProjectSettings>;
    getBits(): Promise<BitSettings[]>;
    getPages(): Promise<PageSettings[]>;
    getBlocks(): Promise<BlockSettings[]>;
    getMaterials(): Promise<Mats>;
    getProjectModel(): Promise<ProjectModel>;
    private getDepBits();
    private getLocalBits();
    private static initializeBit(settings);
    private getScripts(workingDir, namespace);
    private getStyles(workingDir, namespace);
    private getAssets(workingDir, namespace);
    private getLocalMaterials();
    private getDepMaterials();
    private static initializePage(settings);
    private static initializeBlock(settings);
    private getDepBlocks();
    private getLocalBlocks();
    /**
     *  This method is useful for getting a project name for automatically namespacing local bits/blocks/materials without loading the file.
     */
    private getProjectName();
    private static initializeProject(settings);
    private loadSettingsFile(type, workingDir);
    private static getNameRegex(type);
}
