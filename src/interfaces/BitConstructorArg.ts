import { Material } from "./";

export interface BitConstructorArg {
  version: number;
  name: string;
  context?: any;
  script: Material;
  style: Material;
  html: Material;
}