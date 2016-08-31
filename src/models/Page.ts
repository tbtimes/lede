import { PageConstructorArg, Block, Material, MetaTag } from "../interfaces";


export class Page {
  deployPath: string;
  blocks: Block[];
  materials: { scripts: Material[], styles: Material[], assets: Material[] };
  meta: MetaTag[];
  resources: { head: string[], body: string[] };

  constructor({ deployPath, blocks, materials, meta, resources }: PageConstructorArg) {
    this.deployPath = deployPath;
    this.blocks = blocks || [];
    this.meta = meta || [];
    this.materials = { styles: [], scripts: [], assets: [] };
    this.resources = { head: [], body: [] };

    if (materials) {
      this.materials.styles = materials.styles || [];
      this.materials.scripts = materials.scripts || [];
      this.materials.assets = materials.assets || [];
    }

    if (resources) {
      this.resources.head = resources.head || [];
      this.resources.body = resources.body || [];
    }
  };
}

// /**
//  * A Page specifies configuration for one baked html file.
//  *
//  * {prop} deployPath – Path on which to deploy Page. Appended to Project.deployRoot.
//  * {prop} blocks – Ordered list of Blocks to include on Page.
//  * {prop} materials – Specifies {script, style, asset} Materials to include on Page. Materials on a Page belong to one
//  * of three categories (scripts, styles, or assets) and are arranged in an ordered list. Materials that appear later in
//  * the category list will override Materials earlier in the list if they have the same overidableName.
//  * {prop} meta – a list of MetaTags to be applied to the Page.
//  * {prop} resources – Specifies strings to be inserted in the {head, body} of the Page. Useful for linking scripts or
//  * styles from a cdn.
//  */