import { Material, MaterialRef, MetaTag, CacheableMat } from "./";


export interface PageSettings {
  name: string;
  deployPath: string;
  template?: string;
  blocks?: string[];
  materials?: {
    scripts?: MaterialRef[],
    styles?: MaterialRef[],
    assets?: MaterialRef[]
  };
  meta?: MetaTag[];
  resources?: {
    head?: string[],
    body?: string[]
  };
  context?: any;
}

export interface BitContext {
  $name: string;
  $template: string;
}

export interface BlockContext {
  $name: string;
  $template: string;
  $BITS: BitContext[];
}

export interface PageContext {
  $PROJECT: {
    $name: string,
    $deployRoot: string
  };
  $PAGE: {
    $name: string,
    $meta: string[],
    $resources: {
      head: string[],
      body: string[]
    },
    $template: string,
    $deployPath: string
  };
  $BLOCKS: BlockContext[];
}

export interface PageTree {
  workingDir: string;
  context: PageContext;
  styles: CacheableMat;
  scripts: CacheableMat;
  assets: Material[];
}

export interface AssetTree extends PageTree {
  resources: { scripts: string, styles: string };
}