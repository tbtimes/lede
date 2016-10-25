import { Logger } from "bunyan";
const glob = require("glob-promise");
import { join, basename } from "path";
const sander = require("sander");

import { mockLogger } from "./utils";
import { ManyFiles, MissingFile, LoadFile } from "./errors/ProjectFactoryErrors";
import { BitSettings, BlockSettings, PageSettings, ProjectSettings, Material, ProjectModel, PageModel, BitRef } from "./interfaces";
import { Es6Compiler, SassCompiler, NunjucksCompiler } from "./compilers";
import { BLOCK_TMPL, PAGE_TMPL, PROJ_TMPL } from "./DefaultTemplates";

export enum SettingsType {
  Project,
  Page,
  Bit,
  Block
}

export type SETTINGS = BitSettings | BlockSettings | PageSettings | ProjectSettings;

export class ProjectFactory {
  logger: Logger;
  workingDir: string;
  depCacheDir: string;

  constructor({logger, depCacheDir}: {logger?: Logger, depCacheDir: string}) {
    if (!depCacheDir) throw new  Error("Must specify a depCacheDir for ProjectFactory.");
    this.logger = logger || <Logger><any>mockLogger;
    this.workingDir = "";
    this.depCacheDir = depCacheDir;
  }

  configure({logger, workingDir}) {
    this.logger = logger;
    this.workingDir = workingDir;
  }

  static async getProject(workingDir: string, logger: Logger): Promise<ProjectSettings> {
    const settings = <ProjectSettings>(await this.loadSettingsFile(workingDir, SettingsType.Project, logger))[0];
    return this.initializeProject(settings, logger);
  }

   static initializeProject(settings: ProjectSettings, logger: Logger): ProjectSettings {

    // Set up template
     if (!settings.template) settings.template = PROJ_TMPL;

    // Set up defaults
    if (!settings.defaults) {
      settings.defaults = { scripts: [], styles: [], assets: [], metaTags: [], blocks: [] };
    }
    settings.defaults.scripts = settings.defaults.scripts || [];
    settings.defaults.assets = settings.defaults.assets || [];
    settings.defaults.styles = settings.defaults.styles || [];
    settings.defaults.metaTags = settings.defaults.metaTags || [];
    settings.defaults.blocks = settings.defaults.blocks || [];
    settings.context = settings.context || {};

    return settings;
  }

  static async getBits(workingDir: string, depDir: string, logger: Logger): Promise<BitSettings[]> {
    const depPath = join(workingDir, depDir);
    const depDirs = (await glob("*", { cwd: depPath})).map(x => join(depPath, x));

    const [locals, deps] = await Promise.all([
      this.getBitsFrom(workingDir, logger),
      Promise.all(depDirs.map(p => this.getBitsFrom(p, logger)))
    ]);

    // Flatten bitsettings
    return [].concat.apply([], locals).concat([].concat.apply([], deps));
  }

  static async getBitsFrom(workingDir: string, logger: Logger): Promise<BitSettings[]> {
    const bitPaths = (await glob("*", {cwd: join(workingDir, "bits")})).map(x => join(workingDir, "bits", x));
    const settings: BitSettings[] = <any>(await Promise.all(
      bitPaths.map(path => this.loadSettingsFile(path, SettingsType.Bit, logger))
    ));
    return [].concat.apply([], settings).map(this.initializeBit);
  }

   static initializeBit(settings: BitSettings): BitSettings {
    settings.context = settings.context || {};

    return settings;
  }

  static async getPages(workingDir: string, logger: Logger): Promise<PageSettings[]> {
    const settings = <PageSettings[]>(await this.loadSettingsFile(workingDir, SettingsType.Page, logger));
    return settings.map(this.initializePage);
  }

   static initializePage(settings: PageSettings): PageSettings {
    settings.context = settings.context || {};
    settings.blocks = settings.blocks || [];
    settings.meta = settings.meta || [];
    settings.template = settings.template || PAGE_TMPL;

    if (!settings.materials) {
      settings.materials = { scripts: [], styles: [], assets: [] };
    }
    if (!settings.resources) {
      settings.resources = { head: [], body: [] };
    }

    settings.materials.styles = settings.materials.styles || [];
    settings.materials.scripts = settings.materials.scripts || [];
    settings.materials.assets = settings.materials.assets || [];
    settings.resources.head = settings.resources.head || [];
    settings.resources.body = settings.resources.body || [];

    return settings;
  }

  static async getBlocks(workingDir: string, logger: Logger): Promise<BlockSettings[]> {
    const settings = <BlockSettings[]>(await this.loadSettingsFile(workingDir, SettingsType.Block, logger));
    return await Promise.all(settings.map(this.initalizeBlock));
  }

   static async initalizeBlock(settings: BlockSettings): Promise<BlockSettings> {
    settings.bits = settings.bits || [];
    settings.source = settings.source || null;
    settings.context = settings.context || {};
    settings.template = settings.template || BLOCK_TMPL;

    if (settings.source) {
      settings.bits = await settings.source.fetch();
    }

    return settings;
  }

   static async loadSettingsFile(workingDir: string, type: SettingsType, logger: Logger): Promise<SETTINGS[]> {
    let settingsFiles: string[];
    const nameRegex = this.getNameRegex(type);

    // Search for settings
    switch (type) {
      case SettingsType.Project:
        settingsFiles = await glob("*.projectSettings.js", { cwd: workingDir });
        break;
      case SettingsType.Page:
        settingsFiles = await glob("*.pageSettings.js", { cwd: workingDir });
        break;
      case SettingsType.Bit:
        settingsFiles = await glob("*.bitSettings.js", { cwd: workingDir });
        break;
      case SettingsType.Block:
        settingsFiles = await glob("*.blockSettings.js", { cwd: workingDir });
        break;
    }

    // Check for errors in number of settings found
    switch (type) {
      case SettingsType.Project:
        if (!settingsFiles) throw new MissingFile({file: "projectSettings.js", dir: workingDir});
        if (settingsFiles.length > 1) throw new ManyFiles({file: "projectSettings.js", dir: workingDir });
        break;
      case SettingsType.Bit:
        if (!settingsFiles) throw new MissingFile({file: "bitSettings.js", dir: workingDir });
        if (settingsFiles.length > 1) throw new ManyFiles({file: "bitSettings.js", dir: workingDir });
        break;
      default:
        if (!settingsFiles) throw new MissingFile({file: (type === SettingsType.Block) ? "blockSettings.js" : "pageSettings.js" , dir: workingDir });
    }

    // Finally, load the user module and check for errors
    return settingsFiles.map(x => {
      let cfg: any;
      logger.info(`Loading ${join(workingDir, x)}`);
      try {
        cfg = new (require(join(workingDir, x))).default();
      } catch (e) {
        throw new LoadFile({file: x, dir: workingDir, detail: e});
      }
      cfg.name = x.match(nameRegex)[1];
      return cfg;
    });
  }

   static getNameRegex(type: SettingsType): RegExp {
    let settingsFileName: string;

    switch (type) {
      case SettingsType.Project:
        settingsFileName = "*.projectSettings";
        break;
      case SettingsType.Page:
        settingsFileName = "*.pageSettings";
        break;
      case SettingsType.Bit:
        settingsFileName = "*.bitSettings";
        break;
      case SettingsType.Block:
        settingsFileName = "*.blockSettings";
        break;
    }
    return new RegExp(`(.*)\.${settingsFileName}\.js`);
  }

   static async getScripts(workingDir: string, namespace: string): Promise<Material[]> {
    const scripts = await glob("**/*", {cwd: workingDir});
    return scripts.map(s => {
      return {
        namespace,
        type: "script",
        path: join(workingDir, s),
        name: basename(s)
      };
    });
  }

   static async getStyles(workingDir: string, namespace: string): Promise<Material[]> {
    const styles = await glob("**/*", {cwd: workingDir});
    return styles.map(s => {
      return {
        namespace,
        type: "style",
        path: join(workingDir, s),
        name: basename(s)
      };
    });
  }

   static async getAssets(workingDir: string, namespace: string): Promise<Material[]> {
    const assets = await glob("**/*", {cwd: workingDir });
    return assets.map(s => {
      return {
        namespace,
        type: "asset",
        path: join(workingDir, s),
        name: basename(s)
      };
    });
  }

  static async getLocalMaterials(workingDir: string, logger: Logger): Promise<Mats> {
    const settings = await glob("*.projectSettings.js", { cwd: workingDir });
    const nameRegex = this.getNameRegex(SettingsType.Project);

    if (!settings) {
      throw new MissingFile({ file: "projectSettings.js", dir: workingDir });
    } else if (settings.length > 1) {
      throw new ManyFiles({ file: "projectSettings.js", dir: workingDir });
    }

    const localNamespace = settings[0].match(nameRegex)[1];
    const [scripts, styles, assets] = await Promise.all([
      this.getScripts(join(workingDir, "scripts"), localNamespace),
      this.getStyles(join(workingDir, "styles"), localNamespace),
      this.getAssets(join(workingDir, "assets"), localNamespace)
    ]);

    return {
      scripts: scripts ? scripts : [],
      styles: styles ? styles : [],
      assets: assets ? assets : []
    };
  }

  static async getDepMaterials(workingDir: string, logger: Logger): Promise<Mats> {
    const deps = await glob("*", {cwd: workingDir});
    const [scripts, styles, assets] = await Promise.all([
      Promise.all(deps.map(namespace => this.getScripts(join(workingDir, namespace, "scripts"), namespace))),
      Promise.all(deps.map(namespace => this.getStyles(join(workingDir, namespace, "styles"), namespace))),
      Promise.all(deps.map(namespace => this.getAssets(join(workingDir, namespace, "assets"), namespace)))
    ]);

    // Flatten material arrays
    return {
      scripts: [].concat.apply([], scripts),
      styles: [].concat.apply([], styles),
      assets: [].concat.apply([], assets)
    };
  }

  static async getMaterials(workingDir: string, depDir: string, logger: Logger): Promise<Mats> {

    const [ locals, deps ]: Mats[] = await Promise.all([
      this.getLocalMaterials(workingDir, logger),
      this.getDepMaterials(join(workingDir, depDir), logger)
    ]);

    // console.log(deps);
    // console.log(locals);

    return {
      scripts: locals.scripts.concat(deps.scripts),
      styles: locals.styles.concat(deps.styles),
      assets: locals.assets.concat(deps.assets)
    };
  }

  static async buildProjectModel(workingDir, depDir, debug: boolean, logger): Promise<ProjectModel> {
    const proj = await ProjectFactory.getProject(workingDir, logger );
    const fullbits = await ProjectFactory.getBits(workingDir, depDir, logger );
    const pageSettings = await ProjectFactory.getPages(join(workingDir, "pages"), logger);
    const blocks = await ProjectFactory.getBlocks(join(workingDir, "blocks"), logger);
    const mats = await ProjectFactory.getMaterials(workingDir, depDir, logger);

    const pages = pageSettings.reduce((state: PageModel[], page: PageSettings) => {
      const PAGEBLOCKS = proj.defaults.blocks.concat(page.blocks);
      const PAGESCRIPTS = proj.defaults.scripts.concat(page.materials.scripts);
      const PAGESTYLES = proj.defaults.styles.concat(page.materials.styles);
      const PAGEASSETS = proj.defaults.assets.concat(page.materials.assets);

      const cache = {
        scripts: mats.scripts,
        styles: mats.styles,
        assets: mats.assets,
      };

      /////////////
      // CONTEXT //
      /////////////
      const pageCtx = {
        $name: page.name,
        $meta: page.meta,
        $resources: page.resources,
        $template: page.template,
        $deployPath: page.deployPath
      };

      const context = {
        $PROJECT: Object.assign({}, proj.context, { $name: proj.name, $deployRoot: proj.deployRoot, $template: proj.template, $debug: debug }),
        $PAGE: Object.assign({}, page.context, pageCtx),
        $BLOCKS: PAGEBLOCKS.map((blockName: string) => {
          const block = Object.assign({}, blocks.find(x => x["name"] === blockName));
          const bits = block["bits"].map((bit: BitRef) => {
            const b: BitSettings = fullbits.find(x => x["name"] === bit.bit);
            return Object.assign({}, b.context, bit.context, { $name: b.name, $template: b.html});
          });
          return Object.assign({}, block.context, { $name: block.name, $template: block.template, $BITS: bits });
        })
      };

      /////////////
      // SCRIPTS //
      /////////////
      const scripts = {
        globals: PAGESCRIPTS.reduce((state: Array<Material>, mat: {id: string, as?: string}) => {
          const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.as);
          const material = retrieveMaterial({ type: "script", id: mat.id, overridableName: mat.as || null });
          if (indexOfPresent < 0) state.push(material);
          else state[indexOfPresent] = material;
          return state;
        }, []),
        bits: []
      };

      ////////////
      // STYLES //
      ////////////
      const styles = {
        globals: PAGESTYLES.reduce((state: Array<Material>, mat: {id: string, as?: string}) => {
          const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.as);
          const material = retrieveMaterial({ type: "style", id: mat.id, overridableName: mat.as || null });
          if (indexOfPresent < 0) state.push(material);
          else state[indexOfPresent] = material;
          return state;
        }, []),
        bits: []
      };

      ////////////
      // ASSETS //
      ////////////
      const assets = PAGEASSETS.reduce((state: Array<Material>, mat: {id: string, as?: string}) => {
        const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.as);
        const material = retrieveMaterial({ type: "asset", id: mat.id, overridableName: mat.as || null });
        if (indexOfPresent < 0) state.push(material);
        else state[indexOfPresent] = material;
        return state;
      }, []);

      // Gather bit materials
      const bitsWithDupes = PAGEBLOCKS.map((blockName: string) => {
        return blocks.find(x => x.name === blockName).bits
          .map((bitref: BitRef) => {
            const bit = fullbits.find(x => x.name === bitref.bit);
            return {
              script: bit.script,
              style: bit.style
            };
          });
      });

      // Flatten and dedupe
      const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;
      const styleMats = flatten(bitsWithDupes).map(x => x.style);
      const scriptMats = flatten(bitsWithDupes).map(x => x.script);

      styles.bits = [... new Set([... styleMats])];
      scripts.bits = [... new Set([... scriptMats])];

      state.push({ context, styles, scripts, assets, cache });
      return state;
    }, []);

    // RN, this runs serially. Would be nice to do it in parallel with Promise.all
    for (let page of pages) {
      for (let block of page.context.$BLOCKS) {
        for (let bit of block.$BITS) {
          bit.$template = (await sander.readFile(bit.$template)).toString();
        }
      }
    }

    return {
      workingDir,
      pages
    };

    function retrieveMaterial({type, id, overridableName}: {type: string, id: string, overridableName?: string}) {
      const [namespace, name] = id.split("/");
      const mat = mats[`${type}s`].find(m => m.namespace === namespace && m.name === name);
      return Object.assign({}, mat, { overridableName: overridableName || basename(mat.path) });
    }
  }

  public async getProjectModel(debug: boolean): Promise<ProjectModel> {
    return await ProjectFactory.buildProjectModel(this.workingDir, this.depCacheDir, debug, this.logger);
  }
}

export interface Mats {
  scripts: Material[];
  styles: Material[];
  assets: Material[];
}