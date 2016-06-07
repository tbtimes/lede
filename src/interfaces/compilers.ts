export interface CSSPreprocessor {
    compileSingle(fullyQualifiedFilePath: string): Promise<string>;
    run(paths: Array<string>): Promise<Array<string>>;
}

export interface HtmlTemplateAssembler {
    configure(includePaths: string|Array<string>): this;
    renderTemplate(ctx: any): Promise<string>;
}

export interface JSPreprocessor {
    
}