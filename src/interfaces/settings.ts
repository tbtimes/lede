import { CSSPreprocessor, JSPreprocessor, HtmlTemplateAssembler } from './compilers';

export interface InheritanceMap {
    html: (basePath: string) => string;
    css: (basePath: string) => string;
    js: (basePath: string) => string;
    bits: (basePath: string) => string;
}

export interface ProjectSettings {
    inheritanceRoot: string;
    dependsOn: Array<string>;
    CSSPreprocessor?: CSSPreprocessor;
    JSPreprocessor?: JSPreprocessor;
    HtmlTemplateAssembler?: HtmlTemplateAssembler;
    contentLoop: any;
    inheritancePathMap: InheritanceMap
}