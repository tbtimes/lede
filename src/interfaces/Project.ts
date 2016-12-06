import { MaterialRef, MetaTag } from "./";


export interface ProjectSettings {
  name: string;
  deployRoot: string;
  blocks: string[];
  template({styles, scripts, context}: {styles: string, scripts: string, context: any}): string;
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
