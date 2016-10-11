import { MaterialRef, MetaTag, PageModel, CompiledMaterials } from "./";


export interface ProjectSettings {
  name: string;
  deployRoot: string;
  blocks: string[];
  template({styles, scripts, context}: {styles: CompiledMaterials, scripts: CompiledMaterials, context: any}): string;
  defaults: {
    scripts: MaterialRef[],
    styles: MaterialRef[],
    assets: MaterialRef[],
    blocks: string[],
    metaTags: MetaTag[]
  };
  context: any;
}

export interface ProjectModel {
  workingDir: string;
  pages: Array<PageModel>;
}