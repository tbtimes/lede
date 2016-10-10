import { MaterialRef, MetaTag, PageCompiler, MaterialCompiler, PageModel, UninstantiatedCompiler } from "./";


export interface ProjectSettings {
  name: string;
  deployRoot: string;
  blocks: string[];
  template({styles, scripts, context}): string;
  defaults: {
    scripts: MaterialRef[],
    styles: MaterialRef[],
    assets: MaterialRef[],
    blocks: string[],
    metaTags: MetaTag[]
  };
  compilers: {
    html: PageCompiler | UninstantiatedCompiler,
    style: MaterialCompiler | UninstantiatedCompiler,
    script: MaterialCompiler | UninstantiatedCompiler
  };
  context: any;
}

export interface ProjectModel {
  workingDir: string;
  pages: Array<PageModel>;
}