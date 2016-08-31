import { Material, Block, MetaTag, CompilerInitializer, ProjectConstructorArg } from "../interfaces";

export class Project {
  name: string;
  deployRoot: string;
  defaults: { materials: Material[], blocks: Block[], metaTags: MetaTag[] };
  compilers: { html: CompilerInitializer, style: CompilerInitializer, script: CompilerInitializer };
  context: any;

  constructor({ name, deployRoot, defaults, compilers, context }: ProjectConstructorArg) {
    this.name = name;
    this.deployRoot = deployRoot;
    this.defaults = { materials: [], metaTags: [], blocks: [] };
    this.compilers = {
      html: { compilerClass: {}, constructorArg: {} },
      style: { compilerClass: {}, constructorArg: {} },
      script: { compilerClass: {}, constructorArg: {} }
    };

    this.context = context ? context : {};

    if (defaults) {
      this.defaults.materials = defaults.materials ? defaults.materials : [];
      this.defaults.blocks = defaults.blocks ? defaults.blocks : [];
      this.defaults.metaTags = defaults.metaTags ? defaults.metaTags : [];
    }

    if (compilers) {
      this.compilers.html = compilers.html ? compilers.html : { compilerClass: {}, constructorArg: {} };
      this.compilers.script = compilers.script ? compilers.script : { compilerClass: {}, constructorArg: {} };
      this.compilers.style = compilers.style ? compilers.style : { compilerClass: {}, constructorArg: {} };
    }

  }
}


// /**
//  * A Project groups Pages in a one-to-many relationship. A Project allows the user to specify information common
//  * across all Pages.
//  *
//  * {prop} name – A name for the Project. Is injected into the rendering context.
//  * {prop} deployRoot – Defines a root directory for deployment which is prepended to the deployPath for all Pages.
//  * {prop} defaults – Defines default {Materials, Blocks, MetaTags} new Pages should be created with.
//  * {prop} namespaces – Defines default namespaces to check when looking for {Materials, Bits} in Pages.
//  * {prop} pages – List of Pages to which these properties apply.
//  * {prop} compilers – Specifies the {html, style, script} compilers that should be used on the Page. Compilers specify
//  * a compiler class that should be instantiated and the constructor args that should be passed to it.
//  */
// import { Material, Block, MetaTag, Page } from "./";
// }