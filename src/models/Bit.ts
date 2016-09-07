import { Material } from "./";

export interface BitConstructorArg {
  version: number;
  name: string;
  context?: any;
  script: Material;
  style: Material;
  html: Material;
}

export interface BitReference {
  bit: string;
  context?: any;
}

export class Bit {
  version: number;
  name: string;
  context: any;
  script: Material;
  style: Material;
  html: Material;

  constructor({ version, name, context, script, style, html }: BitConstructorArg) {
    this.version = version;
    this.name = name;
    this.context = context ? context : {};
    this.script = script;
    this.style = style;
    this.html = html;
  };
}


// /**
//  * A Bit is essentially the smallest chunk of content on a Page. A Bit is conceptually very similar to a WebComponent.
//  * A Bit specifies at most one script, one style, and one html template.
//  *
//  * {prop} version – Because Bits are shared across Pages, a version allows a Page to explicitly specify which version of
//  * a Bit it wants.
//  * {prop} namespace – A namespace to which this Bit belongs.
//  * {prop} name – A name for the Bit. Properties namespace and name must be unique across all Bits.
//  * {prop} context – A context to be injected into the Bit for use in its html and script Materials.
//  * {prop} script – Defines a Material of type "script" to associate with this Bit.
//  * {prop} style – Defines a Material of type "style" to associate with this Bit.
//  * {prop} html – Defines a Material of type "html" to associate with this Bit.
//  */