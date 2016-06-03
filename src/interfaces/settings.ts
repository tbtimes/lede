import { CSSPreprocessor, JSPreprocessor, HtmlTemplateAssembler } from './compilers';

export interface ProjectSettings {
    inheritanceRoot: string;
    inheritanceChain: Array<string>;
    CSSPreprocessor?: CSSPreprocessor;
    JSPreprocessor?: JSPreprocessor;
    HtmlTemplateAssembler?: HtmlTemplateAssembler;
}