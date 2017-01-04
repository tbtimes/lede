import { PageTree, AssetTree } from "./";
export interface PageCompiler {
    compile(arg: AssetTree): Promise<CompiledPage>;
}
export interface MaterialCompiler {
    compile(tree: PageTree): Promise<string>;
}
export interface CompiledPage {
    path: string;
    renderedPage: string;
    files: Array<{
        name: string;
        content?: string;
        path?: string;
        overridableName?: string;
    }>;
}
