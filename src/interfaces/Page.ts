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

export interface PageModel {
  styles: { globals: Material[], bits: Material[] };
  scripts: { globals: Material[], bits: Material[] };
  cache: { scripts: Material[], styles: Material[] };
  context: any;
  name: string;
}