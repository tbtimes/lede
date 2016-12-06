import { Logger, createLogger } from "bunyan";

import { Deployer, MaterialCompiler, PageCompiler, CompiledMaterials, CompiledPage } from "./interfaces";
import { ProjectFactory } from "./ProjectFactory";
import { Es6Compiler, SassCompiler, NunjucksCompiler } from "./compilers";
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
    this.logger.debug({model: this.model}, "Project model");

    this.logger.info("Building dependency graph");
    const trees = await this.buildPageTrees();
    this.logger.debug({trees}, "Initial page trees");

    this.logger.info("Compiling assets");
    const assetTrees = await this.compileMaterials(trees);
    this.logger.debug({assetTrees}, "Assets compiled and reattached to trees");

    this.logger.info("Rendering pages");
    const compiledPages = await this.renderPages(assetTrees);
    this.logger.debug({compiledPages}, "Pages compiled");


    this.logger.info("Deploying pages");
    await this.deployPages(compiledPages);
  }

  private deployPages(compiledPages) {
    return Promise.all(compiledPages.map(this.deployer.deploy))
      .catch(err => this.logger.error({err}));
  }

  private renderPages(assetTrees) {
    return Promise.all(
      assetTrees.map(this.htmlCompiler.compile.bind(this.htmlCompiler)) // Binding or else "this" isn't properly set on htmlCompiler
    )
      .catch(err => this.logger.error({err}));
  }

  private compileMaterials(trees) {
    return Promise.all(
      trees.map(tree => {
        return Promise.all([
          this.scriptCompiler.compile(tree),
          this.styleCompiler.compile(tree)
        ])
          .then(([scripts, styles]) => {
            return {scripts, styles};
          })
          .then(resources => {
            // attach compiled resources to tree
            tree.resources = resources;
            return tree;
          });
      })
    )
      .catch(err => this.logger.error({err}));
  }

  private buildPageTrees() {
    return Promise.all(this.model.pages.map(page => {
      return this.model.getPageTree({name: page.name, debug: this.debug});
    }))
      .catch(err => this.logger.error({err}));
  }

  private async initializeProjectModel() {
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
  htmlCompiler: new NunjucksCompiler(),
  debug: true
};

const p = new PD(elex);

p.compile().then(console.log).catch(console.log);









