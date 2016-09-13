import { Material } from "../models/Material";

export interface PageTree {
  scripts: {[pageName: string]: { globals: Material[], bits: Material[] }};
  styles: {[pageName: string]: { globals: Material[], bits: Material[] }};
  workingDir: string;
}