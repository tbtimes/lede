import { Logger } from "bunyan";
const sander = require("sander");

import { defaultLogger } from "./DefaultLogger";
import { ProjectReport } from "./models/Project";
import { ProjectFactory } from "./ProjectFactory";
import { BitReference } from "./models/Bit";
import { Page } from "./models/Page";
import { Block } from "./models/Block";
import { Bit } from "./models/Bit";
import { Material } from "./models/Material";
import { Deployer } from "./interfaces/Deployer";
import { PageTree } from "./interfaces/PageTree";


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

  /**
   * Builds a ProjectReport using the projectFactory.
   * @returns {Promise<ProjectReport>}
   */
  public async buildReport(): Promise<ProjectReport> {
    return await this.projectFactory.buildReport();
  }

  public async fetchDependencies() {
    // Loop through pages and look for blocks
    // Loop through blocks and look for bits
    // Loop through bits and look for materials
  }

  /**
   * Takes a ProjectReport and returns a PageTree detailing the pages and materials for each page. All dependencies
   * should be resolved on the ProjectReport BEFORE calling this method.
   * @param report
   * @returns {Promise<PageTree>}
   */
  async buildPageTree(report: ProjectReport): Promise<PageTree> {
    return report["pages"].reduce((state: any, p: Page) => {
      const pageState = {
        scripts: {
          globals: [],
          bits: []
        },
        styles: {
          globals: [],
          bits: []
        },
        context: {}
      };

      const pageBlocks = report["project"].defaults.blocks.concat(p.blocks);

      // -----------
      // --GLOBALS--
      // -----------

      // For globals we just need to deduplicate on the material's overridableName

      pageState.scripts.globals = report["project"].defaults.scripts
        .concat(p.materials.scripts)
        .reduce((state: Material[], mat: Material) => {
          const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.overridableName);
          if (indexOfPresent < 0) state.push(mat);
          else state[indexOfPresent] = mat;
          return state;
        }, []);

      pageState.styles.globals = report["project"].defaults.styles
        .concat(p.materials.scripts)
        .reduce((state: Material[], mat: Material) => {
          const indexOfPresent = state.map(x => x.overridableName).indexOf(mat.overridableName);
          if (indexOfPresent < 0) state.push(mat);
          else state[indexOfPresent] = mat;
          return state;
        }, []);

      // --------
      // --BITS--
      // --------

      // Bits are a little more involved. We need to first find all the blocks used by a page, then find all the bits used
      // by those blocks.

      const bitsWithDupes: [{script: Material, style: Material}] = pageBlocks.map((blockName: string) => {
        return report["blocks"]
          .find((block: Block) => block.name === blockName).bits
          .map((bitref: BitReference) => {
            const bit = report["bits"].find((bit: Bit) => bit.name === bitref.bit);
            return {
              script: bit.script,
              style: bit.style
            };
          });
      });

      // Here we just flatten and dedupe the above array by using a set
      const flatten = a => Array.isArray(a) ? [].concat(...a.map(flatten)) : a;
      const styleMats = flatten(bitsWithDupes).map(x => x.style);
      const scriptMats = flatten(bitsWithDupes).map(x => x.script);

      pageState.scripts.bits = [... new Set(scriptMats)];
      pageState.styles.bits = [... new Set(styleMats)];

      // -----------
      // --CONTEXT--
      // -----------

      const $PROJECT = Object.assign({}, report.project.context, { $name: report.project.name });
      const pageDefaultProps = {
        $name: p.name,
        $meta: report.project.defaults.metaTags.concat(p.meta),
        $template: p.template
      };
      const $PAGE = Object.assign({}, p.context, pageDefaultProps);
      const $BLOCKS = pageBlocks.map((blockName: string) => {
        const block = Object.assign({}, report["blocks"].find(x => x["name"] === blockName));
        const bits = block["bits"].map((bit: BitReference) => {
          const fullBit: Bit = report["bits"].find(x => x["name"] === bit.bit);
          return Object.assign({}, fullBit.context, { $name: fullBit.name, $template: fullBit.html.content });
        });
        return Object.assign({}, block.context, { $name: block.name, $template: block.template, $BITS: bits});
      });

      pageState.context = {
        $PROJECT,
        $PAGE,
        $BLOCKS
      };

      state.pages.push(pageState);

      return state;
    }, { workingDir: report.workingDir, pages: [] });
  }

  /**
   * Compiles and deploys a project according to a ProjectReport
   * @param report
   */
  public async compile(report: ProjectReport) {
    const pageTree = await this.buildPageTree(report);
    const scripts = await report.project.compilers.script.compile(this.workingDir, pageTree);
    const styles = await report.project.compilers.style.compile(this.workingDir, pageTree);
    const renderedPages = await report.project.compilers.html.compile({styles, scripts, report});
    this.deployer.deploy(renderedPages);
  };
}