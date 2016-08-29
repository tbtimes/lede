/**
 * A Page specifies configuration for one baked html file.
 *
 * {prop} deployPath – Path on which to deploy Page. Appended to Project.deployRoot.
 * {prop} blocks – Ordered list of Blocks to include on Page.
 * {prop} materials – Specifies {script, style, asset} Materials to include on Page. Materials on a Page belong to one
 * of three categories (scripts, styles, or assets) and are arranged in an ordered list. Materials that appear later in
 * the category list will override Materials earlier in the list if they have the same overidableName.
 * {prop} meta – a list of MetaTags to be applied to the Page.
 * {prop} resources – Specifies strings to be inserted in the {head, body} of the Page. Useful for linking scripts or
 * styles from a cdn.
 */
import { Block, Material, MetaTag } from "./";


export interface Page {
  deployPath: string;
  blocks: Block[];
  materials?: {
    scripts?: Material[];
    styles?: Material[];
    assets?: Material[];
  };
  meta?: MetaTag[];
  resources?: {
    head?: string[],
    body?: string[]
  };
}