import { LedeProject, ProjectDefaults } from "./LedeProject";
import { basename, dirname } from "path";
import { globProm } from "./Utils";
import { PROJECT_TEMPLATE_FUNCTION } from "./DefaultTemplates";
import { BlockService } from "../services/BlockService";
import { BitService } from "../services/BitService";
import { PageService } from "../services/PageService";

export class ProjectFactory {
  blockService: BlockService;
  pageService: PageService;
  bitService: BitService;

  constructor(bitService: BitService, blockService: BlockService, pageService: PageService) {
    this.bitService = bitService;
    this.blockService = blockService;
    this.pageService = pageService;
  }

  public createFromFile(filePath: string): LedeProject {
    // Get name from file
    const nameRegExp = new RegExp(`(.*)\.*.projectSettings\.js`);
    const name = basename(filePath).match(nameRegExp);
    if (!name) {
      throw new Error(`Not a project file: ${filePath}`);
    }

    // Get rootPath from filePath
    const rootPath = dirname(filePath);

    // Load file and guard against errors
    let cfg;
    try {
      cfg = Object.assign({}, require(filePath).default());
    } catch (e) {
      // TODO: throw more specific error to help guide users
      throw e;
    }

    const defaults = this.getDefaultSettings(cfg);
    const template = cfg.template || PROJECT_TEMPLATE_FUNCTION;
    const deployRoot = cfg.deployRoot || "";
    const context = cfg.context || {};
    const version = cfg.version || 1;

    return new LedeProject(name[1], rootPath, defaults, context, template, deployRoot, version, this.blockService,
      this.bitService, this.pageService);
  }

  protected getDefaultSettings(cfg: any): ProjectDefaults {
    const defaults = {
      scripts: [],
      styles: [],
      assets: [],
      metaTags: [],
      blocks: [],
      resources: {
        head: [],
        body: []
      }
    };
    defaults.scripts = cfg.defaults.scripts || [];
    defaults.assets = cfg.defaults.assets || [];
    defaults.styles = cfg.defaults.styles || [];
    defaults.metaTags = cfg.defaults.metaTags || [];
    defaults.blocks = cfg.defaults.blocks || [];
    defaults.resources = cfg.defaults.resources || {head: [], body: []};
    defaults.resources.head = cfg.defaults.resources.head || [];
    defaults.resources.body = cfg.defaults.resources.body || [];
    return defaults;
  }
}