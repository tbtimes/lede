import * as livereload from 'livereload';
import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as chalk from 'chalk';
import * as chokidar from 'chokidar';
import { resolve, basename } from 'path';

import { existsProm } from '../utils';
import { DependencyAssembler, CacheBuilder, Lede } from '../lede';
import { NunjucksCompiler, SassCompiler, Es6Compiler } from '../compilers';
import { FileSystemDeployer } from '../deployers';
import { CompiledPage, ProjectReport } from '../interfaces';
import { asyncMap, readStreamProm } from "../utils";




export async function devCommand(config) {
  let { workingDir, args, logger } = config;
  let name = args['n'] || args['name'];
  let port = args['x'] || args['port'] || 8000;
  let { servePath, buildPath } = await getPaths(workingDir, name, logger);
  let compilerPath = args['c'] || args['compilers'] || resolve(workingDir, "compilers", "compilerConfig.js");
  let compilers = await getCompilers(compilerPath, logger);
  let lede = new Lede(buildPath, compilers, new FileSystemDeployer(servePath), logger);

  let fileServer = connect();
  let lrServer: any = livereload.createServer();

  fileServer.use(serveStatic(servePath));

  await buildFromGroundUp(buildPath, servePath, port);

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
      let compiler: any = require(compilerTypes[type].path).default;
      comps[type] = new compiler(compilerTypes[type].options)
    }
    return comps;
  } catch(e) {
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
        servePath: resolve(workingDir,'.buildProjects', basename(process.cwd())),
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

async function buildFromGroundUp(buildPath, servePath, port) {
  try {
    let depAssembler = new DependencyAssembler(buildPath);
    let pr = await assembleDeps(depAssembler);
    await buildCache(pr);
    let compiledPage = await compilePage(pr);
    await servePage(servePath, port, pr, compiledPage);
    await createWatcher(pr, servePath, port, buildPath);
  } catch(e) {
    console.log(e);
  }
}


async function assembleDeps(depAssembler: DependencyAssembler) {
  console.log('Assembling dependencies ...');
  let projReport: ProjectReport = await depAssembler.assemble();
  projReport.context.$debug = true;
  return projReport
}

async function buildCache(proj: ProjectReport) {
  console.log('Rebuilding asset cache ..');
  let cacheBuilder = new CacheBuilder(proj);
  await cacheBuilder.buildCache();
}

async function compilePage(proj: ProjectReport) {
  console.log('Compiling page .');
  let htmlCompiler = new NunjucksCompiler();
  return await htmlCompiler.compile(proj, {css: new SassCompiler(), js: new Es6Compiler()})
}

async function servePage(servePath: string, port: Number, projReport: ProjectReport, compiledPage: CompiledPage) {
  console.log(`Serving at ${chalk.green(`localhost:${port}/`)}`);
  let deployer = new FileSystemDeployer(servePath);
  await deployer.deploy({report: projReport, compiledPage})
}

async function createWatcher(projectReport: ProjectReport, servePath, port, buildPath) {
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
    console.log(`Detected change to ${chalk.blue(path)}`);
    buildFromGroundUp(buildPath, servePath, port)
  });

  assetWatcher.on('change', (path, stats) =>{
    console.log(`Detected change to ${chalk.blue(path)}`);
    delete require.cache[require.resolve(path)];
    buildCache(projectReport).then(() => {
      compilePage(projectReport).then((compiledPage) => {
        servePage(servePath, port, projectReport, compiledPage);
      });
    });
  });
}
