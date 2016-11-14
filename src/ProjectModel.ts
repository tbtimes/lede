const sander = require("sander");
import { basename } from "path";

import { PageSettings, BitSettings, BlockSettings, ProjectSettings, Material, BitRef, PageTree } from "interfaces";


export class ProjectModel {
  materials: Material[];
  pages: PageSettings[];
  blocks: BlockSettings[];
  bits: BitSettings[];
  project: ProjectSettings;

  constructor(public workingDir: string) {
    this.pages = [];
    this.materials = [];
    this.blocks = [];
    this.bits = [];
    this.project = null;
  };

  async getPageTree({name, debug}: {name: string, debug?: boolean}): Promise<PageTree> {
    const page = this.pages.find(x => x.name === name);
    const blocks = [...this.project.defaults.blocks, ...page.blocks];
    const scripts = [...this.project.defaults.scripts, ...page.materials.scripts];
    const styles = [...this.project.defaults.styles, ...page.materials.styles];
    const assets = [...this.project.defaults.assets, ...page.materials.assets];

    if (!page) throw new Error(`Page ${name} not found`);

    const context = await this.buildContext({page, blocks, debug});
    const mats = await this.buildMats({scripts, styles, assets, blocks});

    return {
      workingDir: this.workingDir,
      context,
      styles: mats.styles,
      scripts: mats.scripts,
      assets: mats.assets
    };
  };

  private assembleGlobalMats(mats, type) {
    return mats.reduce((state: Material[], mat: {id: string, as?: string}) => {
      const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.as);
      let material;
      try {
        material = this.retrieveMaterial({type, id: mat.id, overridableName: mat.as || null});
      } catch (e) {
        throw new Error(`Cannot parse material ${mat.id}`);
      }
      if (indexOfPresent < 0) {
        state.push(material);
      } else {
        state[indexOfPresent] = material;
      }
      return state;
    }, []);
  }

  private retrieveMaterial({type, id, overridableName}: {type: string, id: string, overridableName?: string}) {
    const { name, namespace } = this.parseId(id);
    const mat = this.materials.find(m => m.namespace === namespace && m.name === name && m.type === type);
    return Object.assign({}, mat, {overridableName: overridableName || basename(mat.path)});
  }

  private async buildMats({scripts, styles, assets, blocks}) {
    const globalScripts = this.assembleGlobalMats(scripts, "script");
    const globalAssets = this.assembleGlobalMats(assets, "asset");
    const globalStyles = this.assembleGlobalMats(styles, "style");

    const { bitStyles, bitScripts } = this.assembleBitMats(blocks);

    return {
      scripts: { globals: globalScripts, bits: bitScripts },
      styles: { globals: globalStyles, bits: bitStyles },
      assets: globalAssets
    };
  }

  private assembleBitMats(blocks) {
    const bitsWithDupes = blocks.map(block => {
      try {
        block = this.parseId(block);
      } catch (err) {
        throw new Error(`Cannot parse block ${block}`)
      }
      return this.blocks.find(x => x.namespace === block.namespace && x.name === block.name).bits
        .map((bitref: BitRef) => {
          const {namespace, name} = this.parseId(bitref.bit);
          const bit = this.bits.find(x => x.namespace === namespace && x.name === name);
          return { script: bit.script, style: bit.style };
        });
    });

    // Flatten and dedupe
    const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;
    const styles = flatten(bitsWithDupes).map(x => x.style);
    const scripts = flatten(bitsWithDupes).map(x => x.script);

    return { bitStyles: [... new Set([...styles])], bitScripts: [... new Set([...scripts])] };
  }

  private async buildContext({page, blocks, debug}) {
    const pageCtx = {
      $name: page.name,
      $meta: [...this.project.defaults.metaTags, ...page.meta],
      $resources: {
        head: [...this.project.defaults.resources.head, ...page.resources.head],
        body: [...this.project.defaults.resources.body, ...page.resources.body]
      },
      $template: page.template,
      $deployPath: page.deployPath
    };

    const projCtx = {
      $name: this.project.name,
      $deployRoot: this.project.deployRoot,
      $template: this.project.template,
      $debug: debug || false
    };

    const pageBlox = await Promise.all(
      blocks.map(b => {
        try {
          b = this.parseId(b);
        } catch (err) {
          throw new Error(`Cannot parse block ${b}`);
        }
        const block = Object.assign({}, this.blocks.find(x => x.namespace === b.namespace && x.name === b.name));
        if (!block.name && block.namespace) throw new Error(`Block ${b.namespace}/${b.name} not found`);
        return new Promise((resolve, reject) => {
          Promise.all(
            block.bits.map(b => {
              let parsedB;
              try {
                parsedB = this.parseId(b.bit);
              } catch (e) {
                throw new Error(`Cannot parse bit ${b.bit}`);
              }
              const bit = this.bits.find(x => {
                return x.namespace === parsedB.namespace && x.name === parsedB.name
              });
              if (!bit) throw new Error(`Bit ${b.bit} not found`);
              return new Promise((resolve, reject) => {
                sander.readFile(bit.html).then($template => {
                  resolve(Object.assign({}, bit.context, b.context, {$name: bit.name, $template}));
                }).catch(reject);
              });
            })
          ).then($BITS => {
            resolve(Object.assign({}, block.context, {$name: block.name, $template: block.template, $BITS}));
          })
            .catch(reject);
        });
      })
    );

    return {
      $PROJECT: Object.assign({}, this.project.context, projCtx),
      $PAGE: Object.assign({}, page.context, pageCtx),
      $BLOCKS: pageBlox
    };
  }

  private parseId(id: string): { name: string, namespace: string } {
    const splitId = id.split("/");
    let namespace, name;
    if (splitId.length === 1) {
      namespace = this.project.name;
      name = id;
    } else if (splitId.length > 2) {
      throw new Error(`Cannot parse ${id}`);
    } else {
      namespace = splitId[0];
      name = splitId[1];
    }
    return { namespace, name };
  }
}
