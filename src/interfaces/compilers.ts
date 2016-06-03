export interface CSSPreprocessor {
    compileSingle(fullyQualifiedFilePath: string): Promise<string>;
    run(paths: Array<string>): Promise<Array<string>>;
}

export interface HtmlTemplateAssembler {
    renderTemplate(templateName: string, ctx: Object): Promise<string>;
}

export interface JSPreprocessor {
    
}