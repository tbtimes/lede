import { Block, MetaTag, Material } from "./";

export interface PageConstructorArg {
  deployPath: string;
  blocks?: Block[];
  materials?: { scripts?: Material[], styles: Material[], assets: Material[] };
  meta?: MetaTag[];
  resources?: { head?: string[], body: string[] };
}