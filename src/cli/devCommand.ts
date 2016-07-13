import * as livereload from 'livereload';
import * as connect from 'connect';
import * as serveStatic from 'serve-static';
import * as chalk from 'chalk';

import { existsProm } from '../utils';
import { DependencyAssembler, CacheBuilder } from '../lede';
import { NunjucksCompiler, SassCompiler, Es6Compiler } from '../compilers';
import { FileSystemDeployer } from '../deployers';
import { ProjectReport } from "../../dist/interfaces/ProjectReport";
import { CompiledPage } from '../interfaces';

let fileServer = connect();
let lrServer: any = livereload.createServer();

export async function devCommand(args, workingDir) {
  let name = args['n'] || args['name'];
  let port = args['x'] || args['port'] || 8000;
  let servePath = `${workingDir}/.builtProjects/${name}`;
  let buildPath = `${workingDir}/${name}`;
  if (!name) {
    try {
      let res = await existsProm(`${process.cwd()}/projectSettings.js`);
      if(res.file) {
        let projName = process.cwd().split('/')[process.cwd().split('/').length - 1];
        servePath = `${workingDir}/.builtProjects/${projName}`;
        buildPath = process.cwd();
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(`Cannot find project. Please specify a ${chalk.blue('-n [name]')} option or change into a project directory. Type ${chalk.blue('lede dev -h')} for help`);
        process.exit(1);
      } else {
        console.error(e);
        process.exit(1);
      }
    }
  }
  fileServer.use(serveStatic(servePath));

  try {
    let depAssembler = new DependencyAssembler(buildPath);
    let pr = await assembleDeps(depAssembler);
    await buildCache(pr);
    let compiledPage = await compilePage(pr);
    servePage(servePath, port, pr, compiledPage);
  } catch(e) {
    console.log(e);
  }
  

  lrServer.watch(servePath);
  fileServer.listen(8000)

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

