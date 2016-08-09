import * as livereload from "livereload";
import * as connect from "connect";
import * as serveStatic from "serve-static";
import * as chalk from "chalk";
import * as chokidar from "chokidar";
import { resolve, basename } from "path";
import { existsProm, asyncMap } from "../utils";
import { Lede } from "../lede";
import { FileSystemDeployer } from "../deployers";

export async function devCommand({workingDir, args, logger}) {
  let name = args['n'] || args['name'];
  let port = args['x'] || args['port'] || 8000;
  let {servePath, buildPath} = await getPaths(workingDir, name, logger);
  let compilerPath = args['c'] || args['compilers'] || resolve(workingDir, "compilers", "compilerConfig.js");
  let compilers = await getCompilers(compilerPath, logger);
  let lede = new Lede(buildPath, compilers,
    {dev: new FileSystemDeployer(servePath)}, logger);
  let fileServer = connect();
  let lrServer: any = livereload.createServer();

  fileServer.use(serveStatic(servePath));
  let projectReport = await lede.deploy("dev", true);
  createWatcher({lede, projectReport, logger});
  logger.info(`Serving at ${chalk.green(`localhost:${port}/`)}`);
  lrServer.watch(servePath);
  fileServer.listen(port);
}

export async function getCompilers(configPath, logger) {
  try {
    let compilerTypes = require(configPath).compilers;
    let comps = {
      html: null,
      css: null,
      js: null
    };
    for (let type in compilerTypes) {
      let compiler: any = require(resolve(process.cwd(), compilerTypes[type].path)).default
      comps[type] = new compiler(compilerTypes[type].options)
    }
    return comps;
  } catch (err) {
    logger.error({err}, "Error loading compilers. Check logs for more info.")
  }
}

export async function getPaths(workingDir, name, logger) {
  if (name) {
    return {
      servePath: resolve(workingDir, ".builtProjects", name),
      buildPath: resolve(workingDir, name)
    }
  }
  try {
    let res = await existsProm(resolve(process.cwd(), 'projectSettings.js'));
    if (res.file) {
      return {
        servePath: resolve(workingDir, '.builtProjects', basename(process.cwd())),
        buildPath: resolve(workingDir, basename(process.cwd()))
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.error({err}, `Cannot find project. Please specify a ${chalk.blue(
        '-n [name]')} option or change into a project directory. Type ${chalk.blue('lede dev -h')} for help`);
    } else {
      logger.error({err}, `An error occurred while opening ${chalk.blue(
        resolve(workingDir, 'projectSettings.js'))}. It is likely that there is a syntax error in the file.`)
    }
    process.exit(1);
  }
}

async function createWatcher(info) {
  let {lede, projectReport, logger} = info;
  let assets = [];
  let cfgs = [];
  let workingDirs = await asyncMap(projectReport.dependencies, (x) => x.workingDir);
  workingDirs.forEach((x) => {
    assets.push(x + '/assets/**/*');
    assets.push(x + '/bits/**/*');
    assets.push(x + '/scripts/**/*');
    assets.push(x + '/styles/**/*');
    assets.push(x + '/blocks/**/*');
    assets.push(x);
    cfgs.push(x + '/projectSettings.js');
    cfgs.push(x + '/baseContext.js');
  });

  let assetWatcher = chokidar.watch(assets, {
    persistent: true,
    ignored: [/[\/\\]\./, /\/(baseContext|projectSettings).js/]
  });
  let configWatcher = chokidar.watch(cfgs, {
    persistent: true
  });

  configWatcher.on('change', path => {
    assetWatcher.close();
    configWatcher.close();
    delete require.cache[require.resolve(path)];
    logger.info(`Detected change to ${chalk.blue(path)}`);
    lede.deploy("dev", true)
        .then(x => projectReport = x);
  });

  assetWatcher.on('change', (path, stats) => {
    console.log(`Detected change to ${chalk.blue(path)}`);
    delete require.cache[require.resolve(path)];
    lede.deploy("dev", true, projectReport);
  });
}
