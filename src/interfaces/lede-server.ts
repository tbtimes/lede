/**
 * Holds all the relevant info necessary to compile a project
 */
interface Project {
  id: Number;
  name: string;
  googleFileId: string;
  scripts?: TextFile[];
  bits?: Bit[];
  styles?: TextFile[];
  assets?: TextFile[];
  blocks?: TextFile[];
}

/**
 * Describes a template which includes files a project may inherit
 */
interface Template {
  id: Number;
  name: string;
  scripts?: TextFile[];
  bits?: Bit[];
  styles?: TextFile[];
  assets?: TextFile[];
  blocks?: TextFile[];
}

/**
 * This data structure describes a file which may be included as a script, style, asset, or block on the page
 */
interface TextFile {
  id: Number
  template: string;
  name: string;
  type: string;
  contents: string;
}

/**
 * Describes a bit which is composed of three TextFiles
 */
interface Bit {
  id: Number;
  template: string;
  name: string;
  style: TextFile;
  script: TextFile;
  html: TextFile;
}