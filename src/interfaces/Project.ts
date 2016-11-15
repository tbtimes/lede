import { MaterialRef, MetaTag, CompiledMaterials } from "./";


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
    metaTags: MetaTag[],
    resources: {
      head: string[],
      body: string[]
    }
  };
  context: any;
}

// export interface ProjectModel {
//   workingDir: string;
//   pages: Array<PageModel>;
// }