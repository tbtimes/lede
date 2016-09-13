import { Logger } from "bunyan";
import { join } from "path";
const sander = require("sander");

import { defaultLogger } from "./DefaultLogger";
import { ProjectReport } from "./models/Project";
import { ProjectFactory } from "./ProjectFactory";
import { BitReference } from "./models/Bit";
import { Page } from "./models/Page";
import { Block } from "./models/Block";
import { Bit } from "./models/Bit";
import { Material } from "./models/Material";
import { Deployer } from "./FileSystemDeployer";


export interface PageTree {
  scripts: {[pageName: string]: { globals: Material[], bits: Material[] }};
  styles: {[pageName: string]: { globals: Material[], bits: Material[] }};
  workingDir: string;
}

export interface ProjectDirectorArgs {
  workingDir: string;
  logger?: Logger;
  projectFactory: ProjectFactory;
  deployer: Deployer;
}

/**
 * The ProjectDirector is the top level abstraction for working with a project. It is responsible for orchestrating the
 * creation of the models, initiating the retrieval of external assets, triggering the compilation of assets, and launching
 * the deployers.
 */
export class ProjectDirector {
  projectFactory: ProjectFactory;
  logger: Logger;
  workingDir: string;
  deployer: Deployer;

  constructor({workingDir, logger, projectFactory, deployer}: ProjectDirectorArgs) {
    if (!workingDir) throw new Error("workingDir is a required parameter.");
    if (!projectFactory) throw new Error("projectFactory is a required parameter.");
    if (!deployer) throw new Error("A deployer must be specified.");
    this.deployer = deployer;
    this.logger = logger || defaultLogger();
    this.workingDir = workingDir;
    this.projectFactory = projectFactory;
  };

  public async buildReport(): Promise<ProjectReport> {
    return await this.projectFactory.buildReport();
  }

  public async fetchDependencies() {
    // Loop through pages and look for blocks
    // Loop through blocks and look for bits
    // Loop through bits and look for materials
  }

  async buildPageTree(report: ProjectReport): Promise<PageTree> {
    return report["pages"].reduce((state: any, p: Page) => {
      state.scripts[p.name] = {};
      state.styles[p.name] = {};
      state.scripts[p.name].globals = p.materials.scripts;
      state.styles[p.name].globals = p.materials.styles;


      // This next part is a little sticky. First we loop through the Page's blocks list to find the name of the blocks
      // that are included on the Page. We use that name to find the full block object from the ProjectReport's blocks.
      // Then we loop over that block's bits to find references to every bit it needs to work. We use the bit references to find
      // the actual bits from the ProjectReport's bits and then return each included bit's script material. The result is
      // that we get an array of arrays of script materials that need to be put on the page.
      const scriptBitsWithDupes = p.blocks.map((blockName: string) => {
        return report["blocks"]
          .find((block: Block) => block.name === blockName).bits
          .map((bitref: BitReference) => {
            return report["bits"]
              .find((bit: Bit) => bit.name === bitref.bit).script;
          });
      });

      // Doing the same thing for styles here. TODO: merge this with above step
      const styleBitsWithDupes = p.blocks.map((blockName: string) => {
        return report["blocks"]
          .find((block: Block) => block.name === blockName).bits
          .map((bitref: BitReference) => {
            return report["bits"]
              .find((bit: Bit) => bit.name === bitref.bit).style;
          });
      });

      // Here we just flatten and dedupe the above array by using a set
      state.scripts[p.name].bits = [...new Set(...scriptBitsWithDupes)];
      state.styles[p.name].bits = [... new Set(...styleBitsWithDupes)];
      return state;
    }, { scripts: {}, styles: {} });
  }

  public async compile(report: ProjectReport) {
    const pageTree = await this.buildPageTree(report);
    const scripts = await report.project.compilers.script.compile(this.workingDir, pageTree);
    const styles = await report.project.compilers.style.compile(this.workingDir, pageTree);
    const renderedPages = await report.project.compilers.html.compile({styles, scripts, report});
    this.deployer.deploy(renderedPages);
  };
}