import { PageContext } from "./interfaces";
export declare const PAGE_TMPL: string;
export declare const BLOCK_TMPL: string;
export declare const PROJ_TMPL: ({styles, scripts, context}: {
    styles: string;
    scripts: string;
    context: PageContext;
}) => string;
