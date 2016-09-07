const sander = require("sander"); // No type defs so we will require it for now TODO: write type defs for sander
import { join } from "path";
import { globProm } from "./utils";
import { inspect } from "util";
import { Logger, createLogger, stdSerializers } from "bunyan";
const PrettyStream = require("bunyan-prettystream");

import {
  Project,
  Bit,
  Page,
  Material,
  PageConstructorArg,
  ProjectConstructorArg,
  BitConstructorArg,
  Block,
  BlockConstructorArg,
  ProjectReport
} from "./models";


/**
 * The ProjectFactory is responsible for reading the FileSystem structure and creating objects to represent the
 * various interfaces.
 */
export class ProjectFactory {
  constructor(public workingDir: string, public logger?: Logger) {
    if (!this.logger) {
      const stream = new PrettyStream();
      stream.pipe(process.stdout);
      this.logger = createLogger({
        name: "ProjectFactory",
        stream: stream,
        level: "error",
        serializers: {
          err: stdSerializers.err
        }
      });
    }
  }

  /**
   * Takes a directory string and returns an instantiated Project.
   * @param workingDir: string – Directory containing a projectSettings file.
   * @returns {Promise<Project>} – Instantiated project
   */
  static async getProject(workingDir: string): Promise<Project> {
    const settings = await globProm("*.projectSettings.js", workingDir);
    const nameRegex = ProjectFactory.getRegex("projectSettings");

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

    return new Project(SettingsConfig);
  }

  /**
   * Takes a directory string and returns a Bit.
   * @param workingDir: string – Directory containing a bitSettings file.
   * @returns {Promise<Bit>}
   */
  static async getBit(workingDir: string): Promise<Bit> {
    const settings = await globProm("*.bitSettings.js", workingDir);
    const nameRegex = ProjectFactory.getRegex("bitSettings");

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

    // TODO instantiate materials

    return new Bit(SettingsConfig);
  }

  /**
   * Takes a directory string and returns an array of Pages in that directory.
   * @param workingDir: string – Directory containing one or more pageSettings files.
   * @returns {Promise<Page[]>}
   */
  static async getPages(workingDir: string): Promise<Page[]> {
    const settings = await globProm("*.pageSettings.js", workingDir);

    // Check that working directory contains a projectSettings file.
    if (!settings) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Could not find a pageSettings file in ${workingDir}`);
    }

    // Since this is user-defined, it could throw. TODO: remember to catch/log this case higher
   return settings.map(s => {
      const cfg: PageConstructorArg = new (require(join(workingDir, s))).default();
      return new Page(cfg);
    });
  }

  /**
   * Takes a directory string and returns an array of Blocks in that directory.
   * @param workingDir
   * @returns {Promise<Block[]>}
   */
  static async getBlocks(workingDir: string): Promise<Block[]> {
    const settingsLocations = await globProm("*.blockSettings.js", workingDir);
    const nameRegex = ProjectFactory.getRegex("blockSettings");
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
    const projectReport = { workingDir: this.workingDir, project: null, pages: [], blocks: [] };
    projectReport["project"] = await ProjectFactory.getProject(this.workingDir);
    projectReport["pages"] = await ProjectFactory.getPages(join(this.workingDir, "pages"));
    projectReport["blocks"] = await ProjectFactory.getBlocks(join(this.workingDir, "blocks"));
    return projectReport;
  }

  private static getRegex(settingsFileName: string) {
    return new RegExp(`(.*)\.${settingsFileName}\.js`);
  }
}
