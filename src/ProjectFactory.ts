const sander = require("sander"); // No type defs so we will require it for now TODO: write type defs for sander
import { join } from "path";
import { Logger } from "bunyan";

import { mockLogger } from "./DefaultLogger";
import { MissingFile, ManyFiles, LoadFile } from "./errors/ProjectFactoryErrors";
import { globProm, asyncMap } from "./utils";
import { Project, ProjectReport, ProjectConstructorArg } from "./models/Project";
import { Bit, BitConstructorArg } from "./models/Bit";
import { Page, PageConstructorArg } from "./models/Page";
import { Block, BlockConstructorArg } from "./models/Block";


/**
 * The ProjectFactory is responsible for reading the FileSystem structure and creating objects to represent the
 * various models. The most important method is buildReport which returns an object encompassing all the local information
 * for a project. This report can be used to compile the various pages as well as determine assets that must be requested
 * from the repository.
 */
export class ProjectFactory {
  logger: Logger;
  workingDir: string;

  constructor({workingDir, logger}: {workingDir: string, logger?: Logger}) {
    if (!workingDir) throw new Error("Must specify a workingDir for ProjectFactory.");
    this.logger = logger || <any>mockLogger();
    this.workingDir = workingDir;
  }

  configure(opts: {logger: Logger}) {
    this.logger = opts.logger;
  }

  /**
   * Takes a directory string and returns an instantiated Project.
   * @param workingDir: string – Directory containing a projectSettings file.
   * @param logger: Logger
   * @returns {Promise<Project>} – Instantiated project
   */
  static async getProject(workingDir: string, logger: Logger): Promise<Project> {
    const settings = await globProm("*.projectSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("projectSettings");

    // Check that working directory contains a single settings file.
    if (!settings) {
      throw new MissingFile({ file: "projectSettings.js", dir: workingDir});
    } else if (settings.length > 1) {
      throw new ManyFiles({ file: "projectSettings.js", dir: workingDir });
    }

    logger.info(`Loading ${settings[0]}`);

    // Since this is user-defined, it could throw.
    let SettingsConfig: ProjectConstructorArg;

    try {
      SettingsConfig = new (require(join(workingDir, settings[0]))).default();
    } catch (e) {
      throw new LoadFile({ file: settings[0], dir: workingDir, detail: e});
    }
    SettingsConfig.name = settings[0].match(nameRegex)[1];

    return await (new Project(SettingsConfig)).init();
  }

  /**
   * Takes a directory string and returns a Bit.
   * @param workingDir: string – Directory containing a bitSettings file.
   * @returns {Promise<Bit>}
   */
  static async getBit(workingDir: string, logger): Promise<Bit> {
    const settings = await globProm("*.bitSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("bitSettings");

    // Check that working directory contains a single settings file.
    if (!settings) {
      throw new MissingFile({ file: "bitSettings.js", dir: workingDir});
    } else if (settings.length > 1) {
      throw new ManyFiles({ file: "bitSettings.js", dir: workingDir });
    }

    logger.info(`Loading ${settings[0]}`);

    // Since this is user-defined, it could throw.
    let SettingsConfig: BitConstructorArg;

    try {
      SettingsConfig = new (require(join(workingDir, settings[0]))).default();
    } catch (e) {
      throw new LoadFile({ file: settings[0], dir: workingDir, detail: e});
    }

    SettingsConfig.name = settings[0].match(nameRegex)[1];


    return await (new Bit(SettingsConfig)).init();
  }

  /**
   * Takes a directory string and returns an array of Pages in that directory.
   * @param workingDir: string – Directory containing one or more pageSettings files.
   * @returns {Promise<Page[]>}
   */
  static async getPages(workingDir: string, logger: Logger): Promise<Page[]> {
    const settings = await globProm("*.pageSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("pageSettings");

    // Check that working directory contains at least one settings file.
    if (!settings) {
      throw new MissingFile({ file: "pageSettings.js", dir: workingDir});
    }

    logger.info(`Detected ${settings.length} pages`);

    // Since this is user-defined, it could throw.
   return asyncMap(settings, async (s) => {
     let cfg: PageConstructorArg;
     logger.info(`Loading ${s}`);
     try {
       cfg = new (require(join(workingDir, s))).default();
     } catch (e) {
       throw new LoadFile({file: s, dir: workingDir, detail: e});
     }

     cfg.name = s.match(nameRegex)[1];
     return await (new Page(cfg)).init();
    });
  }

  /**
   * Takes a directory string and returns an array of Blocks in that directory.
   * @param workingDir
   * @returns {Promise<Block[]>}
   */
  static async getBlocks(workingDir: string, logger: Logger): Promise<Block[]> {
    const settings = await globProm("*.blockSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("blockSettings");

    // Check that working directory contains at least one settings file.
    if (!settings) {
      throw new MissingFile({ file: "blockSettings.js", dir: workingDir});
    }

    logger.info(`Detected ${settings.length} blocks`);

    // instantiate blocks here
    const blocks = settings.map(x => {
      let cfg: BlockConstructorArg;
      logger.info(`Loading ${x}`);
      try {
        cfg = new (require(join(workingDir, x))).default();
      } catch (e) {
        throw new LoadFile({file: x, dir: workingDir, detail: e});
      }

      cfg.name = x.match(nameRegex)[1];
      return new Block(cfg);
    });

    // make sure blocks have all their bits
    return <any>Promise.all(blocks.map(b => b.fetch()));
  }

  /**
   * This method essentially calls all the static methods in the proper sequence and returns a datastructure detailing
   * the project.
   */
  public async buildReport(): Promise<ProjectReport> {
    this.logger.info(`Analyzing project components.`);

    const projectReport = { workingDir: this.workingDir, project: null, pages: [], blocks: [], bits: [] };

    try {
      projectReport["project"] = await ProjectFactory.getProject(this.workingDir, this.logger);
      projectReport["pages"] = await ProjectFactory.getPages(join(this.workingDir, "pages"), this.logger);
      projectReport["blocks"] = await ProjectFactory.getBlocks(join(this.workingDir, "blocks"), this.logger);
      projectReport["bits"] = await asyncMap(
        await globProm("*", join(this.workingDir, "bits")),
        async (path) => await ProjectFactory.getBit(join(this.workingDir, "bits", path), this.logger)
      );
    } catch (err) {
      this.logger.error({err});
      if (err.detail) {
        this.logger.error({err: err.detail}, "^^ details for above error");
      }
    }

    return projectReport;
  }

  /**
   * Returns a regex that matches a name from a file in the format of <name>.<settingsFileName>.js
   * @param settingsFileName - string file name to match on
   * @returns {RegExp}
   */
  private static getNameRegex(settingsFileName: string) {
    return new RegExp(`(.*)\.${settingsFileName}\.js`);
  }
}
