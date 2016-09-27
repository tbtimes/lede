import { Material } from "../models/Material";

export interface PageModel {
  styles: { globals: Material[], bits: Material[] };
  scripts: { globals: Material[], bits: Material[] };
  cache: { scripts: Material[], styles: Material[] };
  context: any;
  name: string;
}

export interface PageTree {
  workingDir: string;
  pages: Array<PageModel>;
}