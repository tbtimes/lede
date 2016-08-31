const sander = require("sander"); // No type defs so we will require it for now TODO: write type defs for sander
import { join } from "path";
import { globProm } from "./utils";

import { Bit, Block, Material, Page, ProjectConstructorArg } from "./interfaces"
import { Project } from "./models";


/**
 * The FileSystemSerializer is responsible for reading the FileSystem structure and creating objects to represent the
 * various interfaces.
 */
export class FileSystemSerializer {
  constructor(public workingDir: string) {}

  /**
   * Takes a directory string and returns an instantiated Project.
   * @param workingDir: string – Directory containing a projectSettings file.
   * @returns Promise<{Project}> – Instantiated project
   */
  static async getProject(workingDir: string): Promise<Project> {
    const settings = await globProm("*.projectSettings.js", workingDir);
    const nameRegex = /(.*)\.projectSettings\.js/;

    // Check that working directory contains a projectSettings file.
    if (!settings) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Could not find a projectSetting file in ${workingDir}`);
    } else if (settings.length > 1) {
      // TODO: Make this a custom error so we can catch it higher up
      throw new Error(`Found multiple projectSettings files in ${workingDir}`);
    }

    // Since this is user-defined, it could throw. TODO: remember to catch/log this case higher
    const SettingsConfig: ProjectConstructorArg = new (require(join(workingDir, settings[0]))).default();
    SettingsConfig.name = settings[0].match(nameRegex)[1];

    return new Project(SettingsConfig);
  }

  static getBit(workingDir: string): Bit {
    const defaultBit: Bit = {
      version: 0,
      namespace: "",
      name: ""
    };

    return defaultBit;
  }

  static getPage(workingDir: string): Page {
    const defaultPage: Page = {
      deployPath: "",
      blocks: []
    };

    return defaultPage;
  }

  static getMaterial(workingDir: string): Material {
    const defaultMaterial = {
      name: "",
      content: "",
      version: 0,
      type: "",
      namespace: "",
      overridableName: ""
    };

    return defaultMaterial;
  }

  static getBlock(workingDir: string): Block {
    const defaultBlock = {
      template: ""
    };

    return defaultBlock;
  }

  static writeBit(workingDir: string, bit: Bit): void {
    return;
  }

  static writePage(workingDir: string, page: Page): void {
    return;
  }

  static writeMaterial(workingDir: string, mat: Material): void {
    return;
  }

  static writeBlock(workingDir: string, block: Block): void {
    return;
  }
}
