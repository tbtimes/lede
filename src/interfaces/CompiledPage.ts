/* tslint:disable */
export interface LinkFile {
  file: string;
  data: string;
}

export interface CompiledPage {
  index: string;
  scripts: LinkFile;
  styles: LinkFile;
  cachePath: string;
}