import { Logger } from "bunyan";
import { MaterialCompiler, PageTree } from "../interfaces";
export declare class Es6Compiler implements MaterialCompiler {
    logger: Logger;
    cacheDir: string;
    constructor(arg?: any);
    compile(tree: PageTree): Promise<string>;
    private static compileBits(cachePath, tree);
    private static compileGlobals(cachePath, tree);
    private static buildCache(cachePath, tree);
}
