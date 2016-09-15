const sander = require("sander"); // No type defs so we will require it for now TODO: write type defs for sander
import { join } from "path";
import { Logger } from "bunyan";

import { defaultLogger } from "./DefaultLogger";
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
    this.logger = logger || defaultLogger();
    this.workingDir = workingDir;
  }

  /**
   * Takes a directory string and returns an instantiated Project.
   * @param workingDir: string – Directory containing a projectSettings file.
   * @returns {Promise<Project>} – Instantiated project
   */
  static async getProject(workingDir: string): Promise<Project> {
    const settings = await globProm("*.projectSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("projectSettings");

    // Check that working directory contains a projectSettings file.
    if (!settings) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Could not find a s file in ${workingDir}`);
    } else if (settings.length > 1) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Found multiple projectSettings files in ${workingDir}`);
    }

    // Since this is user-defined, it could throw. TODO: remember to catch/log this case higher
    const SettingsConfig: ProjectConstructorArg = new (require(join(workingDir, settings[0]))).default();
    SettingsConfig.name = settings[0].match(nameRegex)[1];

    return await (new Project(SettingsConfig)).init();
  }

  /**
   * Takes a directory string and returns a Bit.
   * @param workingDir: string – Directory containing a bitSettings file.
   * @returns {Promise<Bit>}
   */
  static async getBit(workingDir: string): Promise<Bit> {
    const settings = await globProm("*.bitSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("bitSettings");

    // Check that working directory contains a projectSettings file.
    if (!settings) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Could not find a bitSettings file in ${workingDir}`);
    } else if (settings.length > 1) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Found multiple bitSettings files in ${workingDir}`);
    }

    // Since this is user-defined, it could throw. TODO: remember to catch/log this case higher
    const SettingsConfig: BitConstructorArg = new (require(join(workingDir, settings[0]))).default();
    SettingsConfig.name = settings[0].match(nameRegex)[1];


    return await (new Bit(SettingsConfig)).init();
  }

  /**
   * Takes a directory string and returns an array of Pages in that directory.
   * @param workingDir: string – Directory containing one or more pageSettings files.
   * @returns {Promise<Page[]>}
   */
  static async getPages(workingDir: string): Promise<Page[]> {
    const settings = await globProm("*.pageSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("pageSettings");

    // Check that working directory contains a projectSettings file.
    if (!settings) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Could not find a pageSettings file in ${workingDir}`);
    }

    // Since this is user-defined, it could throw. TODO: remember to catch/log this case higher
   return asyncMap(settings, async (s) => {
     const cfg: PageConstructorArg = new (require(join(workingDir, s))).default();
     cfg.name = s.match(nameRegex)[1];
     return await (new Page(cfg)).init();
    });
  }

  /**
   * Takes a directory string and returns an array of Blocks in that directory.
   * @param workingDir
   * @returns {Promise<Block[]>}
   */
  static async getBlocks(workingDir: string): Promise<Block[]> {
    const settingsLocations = await globProm("*.blockSettings.js", workingDir);
    const nameRegex = ProjectFactory.getNameRegex("blockSettings");
    const settings = settingsLocations.map(loc => {
      return { loc, name: loc.match(nameRegex)[1] };
    });

    if (!settings) {
      // TODO: Make this a custom error to catch higher up
      throw new Error(`Could not find a blockSettings file in ${workingDir}`);
    }

    // instantiate blocks here
    const blocks = settings.map(x => {
      const cfg: BlockConstructorArg = new (require(join(workingDir, x.loc))).default();
      cfg.name = x.name;
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
    // TODO: error handling in this method
    const projectReport = { workingDir: this.workingDir, project: null, pages: [], blocks: [], bits: [] };
    const bitDirs = await globProm("*", join(this.workingDir, "bits"));

    projectReport["project"] = await ProjectFactory.getProject(this.workingDir);
    projectReport["pages"] = await ProjectFactory.getPages(join(this.workingDir, "pages"));
    projectReport["blocks"] = await ProjectFactory.getBlocks(join(this.workingDir, "blocks"));
    projectReport["bits"] = await asyncMap(
      await globProm("*", join(this.workingDir, "bits")),
      async (path) => await ProjectFactory.getBit(join(this.workingDir, "bits", path))
    );
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
