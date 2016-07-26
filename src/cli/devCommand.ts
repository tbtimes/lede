import * as livereload from 'livereload';
import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as chalk from 'chalk';
import * as chokidar from 'chokidar';
import { resolve, basename } from 'path';

import { existsProm } from '../utils';
import { Lede } from '../lede';
import { FileSystemDeployer } from '../deployers';
import { asyncMap } from "../utils";




export async function devCommand(config) {
  let { workingDir, args, logger } = config;
  let name = args['n'] || args['name'];
  let port = args['x'] || args['port'] || 8000;
  let { servePath, buildPath } = await getPaths(workingDir, name, logger);
  let compilerPath = args['c'] || args['compilers'] || resolve(workingDir, "compilers", "compilerConfig.js");
  let compilers = await getCompilers(compilerPath, logger);
  let lede = new Lede(buildPath, compilers,
    { dev: new FileSystemDeployer(servePath) }, logger);
  let fileServer = connect();
  let lrServer: any = livereload.createServer();

  fileServer.use(serveStatic(servePath));
  let projectReport = await lede.deploy("dev", true);
  createWatcher({lede, projectReport, logger});
  logger.info(`Serving at ${chalk.green(`localhost:${port}/`)}`);
  lrServer.watch(servePath);
  fileServer.listen(port);
}

async function getCompilers(configPath, logger) {
  try {
    let compilerTypes = require(configPath).compilers;
    let comps = {
      html: null,
      css: null,
      js: null
    };
    for (let type in compilerTypes) {
      // console.log(resolve(process.cwd(), compilerTypes[type].path))
      let compiler: any = require(resolve(process.cwd(), compilerTypes[type].path)).default
      comps[type] = new compiler(compilerTypes[type].options)
    }
    return comps;
  } catch(e) {
    console.log(e)
    logger.error({err: e}, "Error loading compilers. Check logs for more info.")
  }
}

async function getPaths(workingDir, name, logger) {
  if (name) {
    return {
      servePath: resolve(workingDir,".builtProjects", name),
      buildPath: resolve(workingDir, name)
    }
  }
  try {
    let res = await existsProm(resolve(process.cwd(), 'projectSettings.js'));
    if (res.file) {
      return {
        servePath: resolve(workingDir,'.builtProjects', basename(process.cwd())),
        buildPath: resolve(workingDir, basename(process.cwd()))
      }
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      logger.error({err: e}, `Cannot find project. Please specify a ${chalk.blue('-n [name]')} option or change into a project directory. Type ${chalk.blue('lede dev -h')} for help`);
    } else {
      logger.error({err: e}, `An error occurred while opening ${chalk.blue(resolve(workingDir, 'projectSettings.js'))}. It is likely that there is a syntax error in the file.`)
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
    persistant: true,
    ignored: [/[\/\\]\./, /\/(baseContext|projectSettings).js/]
  });
  let configWatcher = chokidar.watch(cfgs, {
    persistant: true
  });

  configWatcher.on('change', path => {
    assetWatcher.close();
    configWatcher.close();
    delete require.cache[require.resolve(path)];
    logger.info(`Detected change to ${chalk.blue(path)}`);
    lede.deploy("dev", true)
      .then(x => projectReport = x);
  });

  assetWatcher.on('change', (path, stats) =>{
    console.log(`Detected change to ${chalk.blue(path)}`);
    delete require.cache[require.resolve(path)];
    lede.deploy("dev", true, projectReport);
  });
}
