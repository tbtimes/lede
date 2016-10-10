import { Material, MaterialRef, MetaTag } from "./";


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

export interface PageModel {
  styles: { globals: Material[], bits: string[] };
  scripts: { globals: Material[], bits: string[] };
  assets: Material[];
  cache: {
    scripts: Material[],
    styles: Material[],
    assets: Material[]
  };
  context: {
    $PROJECT: {
      $name: string,
      $deployRoot: string
    },
    $PAGE: {
      $name: string,
      $meta: string[],
      $resources: {
        $head: string[],
        $body: string[]
      },
      $template: string,
      $deployPath: string
    },
    $BLOCKS: BlockContext[]
  };
}