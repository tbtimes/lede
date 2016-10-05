import { Logger } from "bunyan";
const glob = require("glob-promise");
import { join, basename } from "path";

import { mockLogger } from "./utils";
import { ManyFiles, MissingFile, LoadFile } from "./errors/ProjectFactoryErrors";
import { BitSettings, BlockSettings, PageSettings, ProjectSettings, Material, ProjectModel, UninstantiatedCompiler } from "./interfaces";
import { Es6Compiler, SassCompiler, NunjucksCompiler } from "./compilers";


const PAGE_TMPL = `
<div id="ledeRoot">
  {% asyncAll $block in $BLOCKS %}
    {% BLOCK $block %}
  {% endall %}
</div>
`;

const BLOCK_TMPL = `
<div class="lede-block">
  {% asyncAll $bit in $block.$BITS %}
    {% BIT $bit %}
  {% endall %}
</div>
`;

export enum SettingsType {
  Project,
  Page,
  Bit,
  Block
}

type SETTINGS = BitSettings | BlockSettings | PageSettings | ProjectSettings;

export class ProjectFactory {
  logger: Logger;
  workingDir: string;
  depCacheDir: string;

  constructor({workingDir, logger, depCacheDir}: {workingDir: string, logger?: Logger, cacheDir: string}) {
    if (!workingDir) throw new Error("Must specify a workingDir for ProjectFactory.");
    if (!depCacheDir) throw new  Error("Must specify a depCacheDir for ProjectFactory.");
    this.logger = logger || <Logger>mockLogger;
    this.workingDir = workingDir;
    this.depCacheDir = depCacheDir;
  }

  static async getProject(workingDir: string, logger: Logger): Promise<ProjectSettings> {
    const settings = <ProjectSettings>(await this.loadSettingsFile(workingDir, SettingsType.Project, logger))[0];
    return this.initializeProject(settings, logger);
  }

  private static initializeProject(settings: ProjectSettings, logger: Logger): ProjectSettings {
    const defaultCompilers = {
      html: { compilerClass: NunjucksCompiler, constructorArg: {} },
      style: { compilerClass: SassCompiler, constructorArg: {} },
      script: { compilerClass: Es6Compiler, constructorArg: {} }
    };

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

    // Initialize compilers
    const instantiatedCompilers = { html: null, style: null, script: null };

    instantiatedCompilers.html = settings.compilers && settings.compilers.html ?
      new settings.compilers.html["compilerClass"](settings.compilers.html["constructorArg"]) :
      new defaultCompilers.html.compilerClass(defaultCompilers.html.constructorArg);

    instantiatedCompilers.style = settings.compilers && settings.compilers.style ?
      new settings.compilers.style["compilerClass"](settings.compilers.style["constructorArg"]) :
      new defaultCompilers.style.compilerClass(defaultCompilers.style.constructorArg);

    instantiatedCompilers.script = settings.compilers && settings.compilers.script ?
      new settings.compilers.script["compilerClass"](settings.compilers.script["constructorArg"]) :
      new defaultCompilers.script.compilerClass(defaultCompilers.script.constructorArg);

    for (let comp in instantiatedCompilers) {
      instantiatedCompilers[comp].configure({ logger });
    }

    settings.compilers = instantiatedCompilers;

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
    const settings: BitSettings[] = await Promise.all(
      bitPaths.map(path => this.loadSettingsFile(path, SettingsType.Bit, logger))
    );
    return [].concat.apply([], settings).map(this.initializeBit);
  }

  private static initializeBit(settings: BitSettings): BitSettings {
    settings.context = settings.context || {};

    return settings;
  }

  static async getPages(workingDir: string, logger: Logger): Promise<PageSettings[]> {
    const settings = <PageSettings[]>(await this.loadSettingsFile(workingDir, SettingsType.Page, logger));
    return settings.map(this.initializePage);
  }

  private static initializePage(settings: PageSettings): PageSettings {
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

  private static async initalizeBlock(settings: BlockSettings): Promise<BlockSettings> {
    settings.bits = settings.bits || [];
    settings.source = settings.source || null;
    settings.context = settings.context || {};
    settings.template = settings.template || BLOCK_TMPL;

    if (settings.source) {
      settings.bits = await settings.source.fetch();
    }

    return settings;
  }

  private static async loadSettingsFile(workingDir: string, type: SettingsType, logger: Logger): Promise<SETTINGS[]> {
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
        throw new LoadFile({file: s, dir: workingDir, detail: e});
      }
      cfg.name = x.match(nameRegex)[1];
      return cfg;
    });
  }

  private static getNameRegex(type: SettingsType): RegExp {
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

  private static async getScripts(workingDir: string, namespace: string): Promise<Material[]> {
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

  private static async getStyles(workingDir: string, namespace: string): Promise<Material[]> {
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

  private static async getAssets(workingDir: string, namespace: string): Promise<Material[]> {
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

    return {
      scripts: locals.scripts.concat(deps.scripts),
      styles: locals.styles.concat(deps.styles),
      assets: locals.assets.concat(deps.assets)
    };
  }

  static async buildProjectModel(workingDir, depDir, logger): ProjectModel {
    const proj = await ProjectFactory.getProject(workingDir, logger );
    const bits = await ProjectFactory.getBits(workingDir, "lede_modules", logger );
    const pages = await ProjectFactory.getPages(join(workingDir, "pages"), logger);
    const blocks = await ProjectFactory.getBlocks(join(workingDir, "blocks"), logger);
    const mats = await ProjectFactory.getMaterials(workingDir, "lede_modules", logger);
  }

  public async load(): ProjectModel {
    return await ProjectFactory.buildProjectModel(this.workingDir, this.depCacheDir, this.logger);
  }
}

export interface Mats {
  scripts: Material[];
  styles: Material[];
  assets: Material[];
}