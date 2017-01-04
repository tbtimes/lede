/// <reference types="nunjucks" />
import { Logger } from "bunyan";
import { Environment, Extension } from "nunjucks";
import { PageCompiler } from "../interfaces";
export declare class ComponentExtension implements Extension {
    tags: string[];
    elementName: string;
    constructor({tags, elementName}: {
        tags: any;
        elementName: any;
    });
    parse(parser: any, nodes: any, lexer: any): any;
    run(context: any, arg: any, cb: any): void;
}
export declare class NunjucksCompiler implements PageCompiler {
    env: Environment;
    logger: Logger;
    constructor(arg?: {
        filters?: Array<{
            name: string;
            fn: (txt: string) => string;
        }>;
        extensions?: Array<{
            name: string;
            ext: any;
        }>;
        loaderOptions?: any;
        envOptions?: any;
        loaderPaths?: string[];
        logger?: Logger;
    });
    compile(tree: any): Promise<{
        renderedPage: string;
        path: string;
        files: {
            name: string;
            content: any;
        }[];
    }>;
    renderPage({shell, context}: {
        shell: any;
        context: any;
    }): Promise<string>;
}
