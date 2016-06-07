import { CSSPreprocessor, JSPreprocessor, HtmlTemplateAssembler } from './compilers';

export interface InheritanceMap {
    html: (basePath: string) => string;
    css: (basePath: string) => string;
    js: (basePath: string) => string;
}

export interface ProjectSettings {
    inheritanceRoot: string;
    inheritanceChain: Array<string>;
    CSSPreprocessor?: CSSPreprocessor;
    JSPreprocessor?: JSPreprocessor;
    HtmlTemplateAssembler?: HtmlTemplateAssembler;
    imageMap?: Object;
    baseContext?: Object;
    debug: Boolean;
    contentLoop: any;
    inheritancePathMap: InheritanceMap
}