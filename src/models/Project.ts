import { basename } from "path";
import { Logger } from "bunyan";

import { MetaTag } from "../interfaces/MetaTag";
import { Material } from "./Material";
import { Page } from "./Page";
import { Block } from "./Block";
import { BitReference } from "./Bit";
import { NunjucksCompiler } from "../compilers/NunjucksCompiler";
import { SassCompiler } from "../compilers/SassCompiler";
import { Es6Compiler } from "../compilers/Es6Compiler";
import { Compiler, CompilerInitializer, HtmlCompiler } from "../interfaces/Compiler";
import { asyncMap } from "../utils";


export interface ProjectReport {
  workingDir: string;
  project: Project;
  blocks: string[];
  pages: Page[];
  bits: BitReference[];
}

export interface ProjectConstructorArg {
  name: string;
  deployRoot: string;
  defaults?: {
    scripts?: string[],
    styles?: string[],
    assets?: string[],
    blocks?: string[],
    metaTags?: MetaTag[]
  };
  compilers?: {
    html?: CompilerInitializer,
    style?: CompilerInitializer,
    script?: CompilerInitializer
  };
  context?: any;
  logger: Logger;
}

export class Project {
  name: string;
  deployRoot: string;
  blocks: string[];
  defaults: { scripts: Material[], styles: Material[], assets: Material[], blocks: Block[], metaTags: MetaTag[] };
  compilers: { html: HtmlCompiler, style: Compiler, script: Compiler };
  context: any;

  constructor({ name, deployRoot, defaults, compilers, context, blocks, logger  }: ProjectConstructorArg) {
    this.name = name;
    this.deployRoot = deployRoot;
    this.defaults = { scripts: [], assets: [], styles: [], metaTags: [], blocks: [] };
    const defaultCompilers = {
      html: { compilerClass: NunjucksCompiler, constructorArg: {} },
      style: { compilerClass: SassCompiler, constructorArg: {} },
      script: { compilerClass: Es6Compiler, constructorArg: {} }
    };
    this.blocks = blocks || [];
    this.context = context || {};

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

    for (let comp in instantiatedCompilers) {
      instantiatedCompilers[comp].configure({ logger });
    }

    this.compilers = instantiatedCompilers;

    this.defaults.styles = defaults && defaults.styles ? defaults.styles.map(constructMaterial("style")) : [];
    this.defaults.scripts = defaults && defaults.scripts ? defaults.scripts.map(constructMaterial("script")) : [];
    this.defaults.assets = defaults && defaults.assets ? defaults.assets.map(constructMaterial("asset")) : [];

    function constructMaterial(type) {
      return function(input) {
        if (typeof input === "string") {
          return new Material({location: input, type, overridableName: basename(input)});
        }
        const {location, as} = input;
        return new Material({location, type, overridableName: as});
      };
    }
  }

  async init(): Promise<Project> {
    this.defaults.styles = await asyncMap(this.defaults.styles, async (m) => await m.fetch());
    this.defaults.scripts = await asyncMap(this.defaults.scripts, async (m) => await m.fetch());
    this.defaults.assets = await asyncMap(this.defaults.assets, async (m) => await m.fetch());
    return this;
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