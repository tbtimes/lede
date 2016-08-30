/**
 * A Project groups Pages in a one-to-many relationship. A Project allows the user to specify information common
 * across all Pages.
 *
 * {prop} name – A name for the Project. Is injected into the rendering context.
 * {prop} deployRoot – Defines a root directory for deployment which is prepended to the deployPath for all Pages.
 * {prop} defaults – Defines default {Materials, Blocks, MetaTags} new Pages should be created with.
 * {prop} namespaces – Defines default namespaces to check when looking for {Materials, Bits} in Pages.
 * {prop} pages – List of Pages to which these properties apply.
 * {prop} compilers – Specifies the {html, style, script} compilers that should be used on the Page. Compilers specify
 * a compiler class that should be instantiated and the constructor args that should be passed to it.
 */
import { Material, Block, MetaTag, Page } from "./";


export interface Project {
  name: string;
  deployRoot: string;
  defaults: {
    materials: Material[],
    blocks: Block[],
    metaTags: MetaTag[]
  };
  pages: Page[];
  compilers: {
    html: {
      compilerClass: any,
      constructorArg: any
    },
    style: {
      compilerClass: any,
      constructorArg: any
    },
    script: {
      compilerClass: any,
      constructorArg: any
    }
  };
}