import { Logger } from "bunyan";
import { Options } from "node-sass";
import { MaterialCompiler, PageTree } from "../interfaces";
export declare class SassCompiler implements MaterialCompiler {
    logger: Logger;
    renderOpts: Options;
    cacheDir: string;
    constructor(arg?: any);
    compile(tree: PageTree): Promise<string>;
    private compileBits(cachePath, tree);
    private compileGlobals(cachePath, tree);
    private renderFile(filePath, opts);
    private buildCache(cachePath, tree);
}
