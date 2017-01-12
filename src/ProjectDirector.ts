import { Logger } from "bunyan";

import { Deployer, MaterialCompiler, PageCompiler, CompiledPage, AssetTree, PageTree } from "./interfaces";
import { ProjectFactory } from "./ProjectFactory";
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

export class ProjectDirector {
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

  watch({ blocks, scripts, styles, assets, pages, bits, project}): void {
    this.addWatcherCallbacks("block", blocks);
    this.addWatcherCallbacks("page", pages);
    this.addWatcherCallbacks("script", scripts);
    this.addWatcherCallbacks("style", styles);
    this.addWatcherCallbacks("asset", assets);
    this.addWatcherCallbacks("bit", bits);
    this.addWatcherCallbacks("project", project);
  }

  private addWatcherCallbacks(type, watcher) {
    const factory = this.projectFactory;
    watcher.on("change", path => {
      this.logger.info(`Detected change to ${path}`);
      if (require.cache[require.resolve(path)]) delete require.cache[require.resolve(path)];
      this.model.refresh({ type, path, factory })
          .then(this.recompile.bind(this))
        .catch(e => { throw e; });
    });
    watcher.on("add", path => {
      this.logger.info(`Detected change to ${path}`);
      watcher.add(path);
      this.model.add({ type, path, factory })
        .then(this.recompile.bind(this))
        .catch(e => { throw e; });
    });
    watcher.on("unlink", path => {
      this.logger.info(`Detected change to ${path}`);
      if (require.cache[require.resolve(path)]) delete require.cache[require.resolve(path)];
      watcher.unwatch(path);
      this.model.remove({ type, path, factory })
          .then(this.recompile.bind(this))
        .catch(e => { throw e; });
    });
  }

  async recompile(pageNames) {
    this.logger.info(`Recompiling the following pages: ${pageNames.join(", ")}`);
    console.log(this.model.bits.map(x => x.name));
    const trees = await <PageTree[]><any>Promise.all(pageNames.map(name => this.model.getPageTree({name, debug: this.debug})));
    const assetTrees = await this.compileMaterials(trees);
    const compiledPages = await this.renderPages(assetTrees);
    this.logger.info("Deploying pages");
    await this.deployPages(compiledPages);
  }

  async compile(): Promise<void> {
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

  private deployPages(compiledPages: CompiledPage[]): Promise<void> {
    return Promise.all(compiledPages.map(this.deployer.deploy.bind(this.deployer)))
      .catch(err => {
        this.logger.error({err});
      });
  }

  private renderPages(assetTrees: AssetTree[]): Promise<CompiledPage[]> {
    return Promise.all(
      assetTrees.map( t => {
        return this.htmlCompiler.compile.bind(this.htmlCompiler)(t, this.debug); // Binding or else "this" isn't properly set on htmlCompiler
      })
    )
      .catch(err => this.logger.error({err}));
  }

  private compileMaterials(trees: PageTree[]): AssetTree[] {
    return <AssetTree[]><any>Promise.all(
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
            // noinspection JSPrimitiveTypeWrapperUsage
            tree["resources"] = resources;
            return tree;
          });
      })
    )
      .catch(err => this.logger.error({err}));
  }

  private buildPageTrees(): Promise<PageTree[]> {
    return Promise.all(this.model.pages.map(page => {
      return this.model.getPageTree({name: page.name, debug: this.debug});
    }))
      .catch(err => this.logger.error({err}));
  }

  private async initializeProjectModel(): Promise<void> {
    this.model = await this.projectFactory.getProjectModel();
  }
}
