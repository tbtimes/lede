import { Dependency } from './Dependency';

export interface ProjectReport {
    workingDirectory: string;
    content: any;
    dependencies: Dependency[];
    context: any;
    JSPreprocessor?: any;
    CSSPreprocessor?: any;
    HtmlTemplateAssembler?: any;
}