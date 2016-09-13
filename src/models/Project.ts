import { MetaTag } from "../interfaces/MetaTag";
import { Material } from "./Material";
import { Page } from "./Page";
import { Block } from "./Block";
import { Bit } from "./Bit";
import { NunjucksCompiler } from "../compilers/NunjucksCompiler";
import { SassCompiler } from "../compilers/SassCompiler";
import { Es6Compiler } from "../compilers/Es6Compiler";
import { Compiler, CompilerInitializer, HtmlCompiler } from "../interfaces/Compiler";


export interface ProjectReport {
  workingDir: string;
  project: Project;
  blocks: Block[];
  pages: Page[];
  bits: Bit[];
}

export interface ProjectConstructorArg {
  name: string;
  deployRoot: string;
  defaults?: {
    materials?: Material[],
    blocks?: Block[],
    metaTags?: MetaTag[]
  };
  compilers?: {
    html?: CompilerInitializer,
    style?: CompilerInitializer,
    script?: CompilerInitializer
  };
  context?: any;
}

export class Project {
  name: string;
  deployRoot: string;
  defaults: { materials: Material[], blocks: Block[], metaTags: MetaTag[] };
  compilers: { html: HtmlCompiler, style: Compiler, script: Compiler };
  context: any;

  constructor({ name, deployRoot, defaults, compilers, context }: ProjectConstructorArg) {
    this.name = name;
    this.deployRoot = deployRoot;
    this.defaults = { materials: [], metaTags: [], blocks: [] };
    const defaultCompilers = {
      html: { compilerClass: NunjucksCompiler, constructorArg: {} },
      style: { compilerClass: SassCompiler, constructorArg: {} },
      script: { compilerClass: Es6Compiler, constructorArg: {} }
    };

    this.context = context ? context : {};

    if (defaults) {
      this.defaults.materials = defaults.materials ? defaults.materials : [];
      this.defaults.blocks = defaults.blocks ? defaults.blocks : [];
      this.defaults.metaTags = defaults.metaTags ? defaults.metaTags : [];
    }

    // Initialize compilers
    const instantiatedCompilers = { html: null, style: null, script: null};
    instantiatedCompilers.html = compilers && compilers.html ?
      new compilers.html.compilerClass(compilers.html.constructorArg) :
      new defaultCompilers.html.compilerClass(defaultCompilers.html.constructorArg);

    instantiatedCompilers.style = compilers && compilers.style ?
      new compilers.style.compilerClass(compilers.style.constructorArg) :
      new defaultCompilers.style.compilerClass(defaultCompilers.style.constructorArg);

    instantiatedCompilers.script = compilers && compilers.script ?
      new compilers.script.compilerClass(compilers.script.constructorArg) :
      new defaultCompilers.script.compilerClass(defaultCompilers.script.constructorArg);
    this.compilers = instantiatedCompilers;
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