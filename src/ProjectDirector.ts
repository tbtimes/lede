import { Logger, createLogger } from "bunyan";

import { Deployer, MaterialCompiler, PageCompiler, CompiledMaterials, CompiledPage } from "./interfaces";
import { ProjectFactory } from "./ProjectFactory";
import { Es6Compiler, SassCompiler } from "./compilers";
import { ProjectModel } from "./ProjectModel";


export interface ProjectDirectorArgs {
  workingDir: string;
  logger: Logger;
  depCacheDir: string;
  deployer: Deployer;
  styleCompiler: MaterialCompiler;
  scriptCompiler: MaterialCompiler;
  htmlCompiler: PageCompiler;
  debug: boolean;
}

export class PD {
  deployer: Deployer;
  logger: Logger;
  workingDir: string;
  projectFactory: ProjectFactory;
  scriptCompiler: MaterialCompiler;
  styleCompiler: MaterialCompiler;
  htmlCompiler: PageCompiler;
  debug: boolean;
  model: ProjectModel;

  constructor({workingDir, logger, depCacheDir, deployer, htmlCompiler, styleCompiler, scriptCompiler, debug}: ProjectDirectorArgs) {
    this.deployer = deployer;
    this.logger = logger;
    this.workingDir = workingDir;
    this.projectFactory = new ProjectFactory({workingDir, logger, depCacheDir});
    this.scriptCompiler = scriptCompiler;
    this.styleCompiler = styleCompiler;
    this.htmlCompiler = htmlCompiler;
    this.debug = debug;
  }

  async compile() {
    this.logger.info("Assembling project dependencies");
    await this.initializeProjectModel();
    this.logger.debug(this.model.project, "project");
    this.logger.debug(this.model.pages, "pages");
    this.logger.debug(this.model.materials, "materials");
    this.logger.debug(this.model.blocks, "blocks");
    this.logger.debug(this.model.bits, "bits");

    this.logger.info("Building dependency graph");
    const trees = await Promise.all(this.model.pages.map(page => {
      return this.model.getPageTree({name: page.name, debug: this.debug});
    }));
    trees.forEach((t, i) => this.logger.debug(t));

    require("fs").writeFileSync("tree0.json", JSON.stringify(trees[0], null, 2));

    this.logger.info("Compiling assets");

    let pageResources;
    try {
      pageResources = await Promise.all(
        trees.map(tree => {
          return Promise.all([
            this.scriptCompiler.compile(tree),
            this.styleCompiler.compile(tree)
          ])
            .then(([scripts, styles]) => {
              return {scripts, styles};
            });
        })
      );
    } catch (e) {
      console.log(e);
    }

    require("fs").writeFileSync("resources.json", JSON.stringify(pageResources, null, 2));


    return "fin";

    // let tree: ProjectModel, renderedPages: CompiledPage[];
    //
    // this.logger.info("Assembling project dependencies.");
    // try {
    //   tree = await this.projectFactory.getProjectModel(this.debug);
    //   this.tree = tree;
    //   this.logger.debug({tree}, "Project model");
    // } catch (err) {
    //   this.logger.error({err}, "There was an error assembling dependencies");
    //   return;
    // }
    //
    // this.logger.info("Compiling styles and scripts.");
    // let [scripts, styles] = <CompiledMaterials[]>(await Promise.all([
    //   this.scriptCompiler.compile(tree),
    //   this.styleCompiler.compile(tree)
    // ]).catch(err => {
    //   this.logger.error({err}, "An error occurred while compiling materials.");
    //   return;
    // }));
    // this.logger.debug({scripts, styles}, "Compiled materials");
    //
    // this.logger.info("Rendering pages.");
    // try {
    //   renderedPages = await this.htmlCompiler.compile({tree, styles, scripts});
    //   this.logger.debug({ renderedPages }, "Rendered pages");
    // } catch (err) {
    //   this.logger.error({err}, "An error occurred while rendering the pages.");
    //   return;
    // }
    //
    // this.logger.info("Deploying pages.");
    // try {
    //   await this.deployer.deploy(renderedPages);
    // } catch (err) {
    //   this.logger.error({err}, "An error occurred while deploying the pages.");
    //   return;
    // }
  }

  private async compileMaterials() {
    return await Promise.all([ this.scriptCompiler.compile(this.model)])
  }

  private async initializeProjectModel() {
    this.logger.info("Assembling project dependencies");
    this.model = await this.projectFactory.getProjectModel();
  }
}

const logger = createLogger({
  name: "boo",
  streams: [{
    level: "debug",
    path: "boo.log"
  }]
});

const elex = {
  workingDir: "/Users/emurray/WebstormProjects/elections-page",
  logger,
  depCacheDir: "lede_modules",
  deployer: {},
  styleCompiler: new SassCompiler(),
  scriptCompiler: new Es6Compiler(),
  htmlCompiler: {},
  debug: true
};

const p = new PD(elex);

p.compile().then(console.log).catch(console.log);









