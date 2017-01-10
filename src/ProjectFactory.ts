import { Logger } from "bunyan";
import { join } from "path";
const glob = require("glob-promise");
const sander = require("sander");

import { ProjectModel } from "./ProjectModel";
import { ManyFiles, MissingFile, LoadFile } from "./errors/ProjectFactoryErrors";
import {
  BitSettings,
  BlockSettings,
  PageSettings,
  ProjectSettings,
  Material,
} from "./interfaces";
import { BLOCK_TMPL, PAGE_TMPL, PROJ_TMPL } from "./DefaultTemplates";
import { flatten } from "./utils";


export enum SettingsType {
  Project,
  Page,
  Bit,
  Block
}

export type SETTINGS = BitSettings | BlockSettings | PageSettings | ProjectSettings;

export interface Mats {
  scripts: Material[];
  styles: Material[];
  assets: Material[];
}

export class ProjectFactory {
  logger: Logger;
  workingDir: string;
  depCache: string;

  constructor({workingDir, depCacheDir, logger}: {workingDir: string, depCacheDir: string, logger: Logger}) {
    this.logger = logger;
    this.workingDir = workingDir;
    this.depCache = join(workingDir, depCacheDir);
  };

  static async instantiate({type, path}) {

  }

  async getProject(): Promise<ProjectSettings> {
    try {
      const settings = <ProjectSettings>(await this.loadSettingsFile(SettingsType.Project, this.workingDir))[0];
      return ProjectFactory.initializeProject(settings);
    } catch (err) {
      throw err;
    }
  };

  async getBits(): Promise<BitSettings[]> {
    const localBits = await this.getLocalBits();
    const depBits = flatten(await this.getDepBits());
    return [...localBits, ...depBits];
  };

  async getPages(): Promise<PageSettings[]> {
    const settings = <PageSettings[]>(await this.loadSettingsFile(SettingsType.Page, join(this.workingDir, "pages")));
    return settings.map(ProjectFactory.initializePage);
  };

  async getBlocks(): Promise<BlockSettings[]> {
    const [localBlocks, depBlocks] = await Promise.all([
      this.getLocalBlocks(),
      this.getDepBlocks()
    ]);

    return await Promise.all([...localBlocks, ...flatten(depBlocks)].map(ProjectFactory.initializeBlock));
  };

  async getMaterials(): Promise<Mats> {
    const [locals, deps]: Mats[] = await Promise.all([
      this.getLocalMaterials(),
      this.getDepMaterials()
    ]);
    return {
      scripts: [...locals.scripts, ...deps.scripts],
      styles: [...locals.styles, ...deps.styles],
      assets: [...locals.assets, ...deps.assets]
    };
  };

  async getProjectModel(): Promise<ProjectModel> {
    const pm = new ProjectModel(this.workingDir);
    const [project, pages, materials, blocks, bits] = await Promise.all([
      this.getProject(),
      this.getPages(),
      this.getMaterials(),
      this.getBlocks(),
      this.getBits()
    ]);
    pm.project = project;
    pm.bits = bits;
    pm.blocks = blocks;
    pm.pages = pages;
    pm.materials = [...materials.scripts, ...materials.styles, ...materials.assets];
    return pm;
  };

  private async getDepBits(): Promise<Array<BitSettings[]>> {
    const depDirs = (await glob("*", {cwd: this.depCache})).map(x => Object.assign({}, {namespace: x, path: join(this.depCache, x)}));
    return <Array<BitSettings[]>><any>Promise.all(
      depDirs.map(p => {
        return new Promise((res, rej) => {
          glob("*", {cwd: join(p.path, "bits")})
            .then(x => {
              return x.map(x => join(p.path, "bits", x));
            })
            .then(bitPaths => {
              return Promise.all(
                bitPaths.map(path => this.loadSettingsFile(SettingsType.Bit, path))
              );
            }).then(settings => {
              res(flatten(settings).map(ProjectFactory.initializeBit).map(x => Object.assign(x, {namespace: p.namespace})));
          })
            .catch(rej);
        });
      })
    );
  };

  private async getLocalBits(): Promise<BitSettings[]> {
    const localNamespace = await this.getProjectName();
    const bitPaths = (await glob("*", {cwd: join(this.workingDir, "bits")})).map(x => join(this.workingDir, "bits", x));
    const settings =  (await Promise.all(bitPaths.map(path => this.loadSettingsFile(SettingsType.Bit, path))));

    // Flatten nested arrays
    return [].concat.apply([], settings)
      .map(ProjectFactory.initializeBit)
      .map(x => Object.assign(x, {namespace: localNamespace}));
  };

  private static initializeBit(settings: BitSettings): BitSettings {
    settings.context = settings.context || {};

    return settings;
  };

  private async getScripts(workingDir, namespace): Promise<Material[]> {
    const scripts = await glob("**/*.*", {cwd: workingDir});
    return scripts.map(s => {
      return {
        namespace,
        type: "script",
        path: join(workingDir, s),
        name: s
      };
    });
  };

  private async getStyles(workingDir, namespace): Promise<Material[]> {
    const styles = await glob("**/*.*", {cwd: workingDir});
    return styles.map(s => {
      return {
        namespace,
        type: "style",
        path: join(workingDir, s),
        name: s
      };
    });
  };

  private async getAssets(workingDir, namespace): Promise<Material[]> {
    const assets = await glob("**/*.*", {cwd: workingDir});
    return assets.map(s => {
      return {
        namespace,
        type: "asset",
        path: join(workingDir, s),
        name: s
      };
    });
  };

  private async getLocalMaterials(): Promise<Mats> {
    const localNamespace = await this.getProjectName();
    const [scripts, styles, assets] = await Promise.all([
      this.getScripts(join(this.workingDir, "scripts"), localNamespace),
      this.getStyles(join(this.workingDir, "styles"), localNamespace),
      this.getAssets(join(this.workingDir, "assets"), localNamespace)
    ]);

    return {
      scripts: scripts ? scripts : [],
      styles: styles ? styles : [],
      assets: assets ? assets : []
    };
  };

  private async getDepMaterials(): Promise<Mats> {
    const deps = await glob("*", {cwd: this.depCache});
    const [scripts, styles, assets] = await Promise.all([
      Promise.all(deps.map(namespace => this.getScripts(join(this.depCache, namespace, "scripts"), namespace))),
      Promise.all(deps.map(namespace => this.getStyles(join(this.depCache, namespace, "styles"), namespace))),
      Promise.all(deps.map(namespace => this.getAssets(join(this.depCache, namespace, "assets"), namespace)))
    ]);

    // Flatten material arrays
    return {
      scripts: [].concat.apply([], scripts),
      styles: [].concat.apply([], styles),
      assets: [].concat.apply([], assets)
    };
  };

  private static initializePage(settings: PageSettings): PageSettings {
    settings.context = settings.context || {};
    settings.blocks = settings.blocks || [];
    settings.meta = settings.meta || [];
    settings.template = settings.template || PAGE_TMPL;

    if (!settings.materials) {
      settings.materials = {scripts: [], styles: [], assets: []};
    }
    if (!settings.resources) {
      settings.resources = {head: [], body: []};
    }

    settings.materials.styles = settings.materials.styles || [];
    settings.materials.scripts = settings.materials.scripts || [];
    settings.materials.assets = settings.materials.assets || [];
    settings.resources.head = settings.resources.head || [];
    settings.resources.body = settings.resources.body || [];

    return settings;
  };

  private static async initializeBlock(settings: BlockSettings) {
    settings.bits = settings.bits || [];
    settings.source = settings.source || null;
    settings.context = settings.context || {};
    settings.template = settings.template || BLOCK_TMPL;

    settings.bits = settings.bits || [];
    settings.source = settings.source || null;
    settings.context = settings.context || {};
    settings.template = settings.template || BLOCK_TMPL;

    if (settings.source) {
      settings.bits = await fetchGDOC({tries: 0, settings});
    }

    // Implements exponential backoff
    function fetchGDOC({tries, settings}) {
      return new Promise((resolve, reject) => {
        if (tries < 5) {
          settings.sources.fetch().then(resolve)
                  .catch(err => {
                    if (err.code !== 403) { // Code 403: Rate limit exceeded
                      return reject(err);
                    } else {
                      tries += 1;
                      setTimeout(() => {
                        return fetchGDOC({tries, settings}).then(resolve).catch(reject);
                      }, Math.pow(2, tries) + Math.random() * 100);
                    }
                  });
        } else {
          return reject(new Error("Gdocs rate limit exceeded. Try again in a few minutes."));
        }
      });
    }

    return settings;
  };

  private async getDepBlocks(): Promise<BlockSettings[]> {
    const deps = await glob("*", {cwd: this.depCache});
    return <BlockSettings[]><any>Promise.all(
      deps.map(dep => {
        const p = join(this.depCache, dep, "blocks");
        return this.loadSettingsFile(SettingsType.Block, p)
          .then((x: BlockSettings[]) => {
            return x.map((b: BlockSettings) => Object.assign({}, b, {namespace: dep}));
          });
      })
    );
  };

  private async getLocalBlocks(): Promise<BlockSettings[]> {
    const localNamespace = await this.getProjectName();
    return <BlockSettings[]>(await this.loadSettingsFile(SettingsType.Block, join(this.workingDir, "blocks")))
      .map((x: BlockSettings) => Object.assign({}, x, {namespace: localNamespace}));
  };

  /**
   *  This method is useful for getting a project name for automatically namespacing local bits/blocks/materials without loading the file.
   */
  private async getProjectName(): Promise<string> {
    const projNameRegex = ProjectFactory.getNameRegex(SettingsType.Project);
    const projFile = (await glob("*.projectSettings.js", {cwd: this.workingDir}))[0];
    return projFile.match(projNameRegex)[1];
  };

  private static initializeProject(settings: ProjectSettings): ProjectSettings {
    // Set up template
    if (!settings.template) {
      settings.template = PROJ_TMPL;
    }

    // Set up defaults
    if (!settings.defaults) {
      settings.defaults = {scripts: [], styles: [], assets: [], metaTags: [], blocks: [], resources: { head: [], body: []}};
    }
    settings.defaults.scripts = settings.defaults.scripts || [];
    settings.defaults.assets = settings.defaults.assets || [];
    settings.defaults.styles = settings.defaults.styles || [];
    settings.defaults.metaTags = settings.defaults.metaTags || [];
    settings.defaults.blocks = settings.defaults.blocks || [];
    settings.context = settings.context || {};

    return settings;
  };

  private async loadSettingsFile(type: SettingsType, workingDir: string): Promise<SETTINGS[]> {
    let settingsFiles: string[];
    const nameRegex = ProjectFactory.getNameRegex(type);

    // Search for settings
    switch (type) {
      case SettingsType.Project:
        settingsFiles = await glob("*.projectSettings.js", {cwd: workingDir});
        break;
      case SettingsType.Page:
        settingsFiles = await glob("*.pageSettings.js", {cwd: workingDir});
        break;
      case SettingsType.Bit:
        settingsFiles = await glob("*.bitSettings.js", {cwd: workingDir});
        break;
      case SettingsType.Block:
        settingsFiles = await glob("*.blockSettings.js", {cwd: workingDir});
        break;
    }


    // Check for errors in number of settings found
    switch (type) {
      case SettingsType.Project:
        if (!settingsFiles) {
          throw new MissingFile({file: "projectSettings.js", dir: workingDir});
        }
        if (settingsFiles.length > 1) {
          throw new ManyFiles({file: "projectSettings.js", dir: workingDir});
        }
        break;
      case SettingsType.Bit:
        if (!settingsFiles) {
          throw new MissingFile({file: "bitSettings.js", dir: workingDir});
        }
        if (settingsFiles.length > 1) {
          throw new ManyFiles({file: "bitSettings.js", dir: workingDir});
        }
        break;
      default:
        // Do we want to throw an error if there are no pages or blocks?
        // console.log(settingsFiles)
        // console.log(settingsFiles === [])
        // if (settingsFiles === []) {
        //   throw new MissingFile({
        //     file: (type === SettingsType.Block) ? "blockSettings.js" : "pageSettings.js",
        //     dir: workingDir
        //   });
        // }
        // break;
        break;
    }
    // Finally, load the user module and check for errors
    return settingsFiles.map(x => {
      let cfg: any;
      try {
        // The following line is suppressing a WebStorm warning about constructors with lowercase names.
        // noinspection TypeScriptValidateJSTypes,JSPotentiallyInvalidConstructorUsage
        cfg = new (require(join(workingDir, x))).default();
      } catch (e) {
        throw new LoadFile({file: x, dir: workingDir, detail: e});
      }
      cfg.name = x.match(nameRegex)[1];
      return cfg;
    });
  };

  private static getNameRegex(type): RegExp {
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
  };
}
