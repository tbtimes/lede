import * as chalk from 'chalk';

import { Es6Compiler, NunjucksCompiler, SassCompiler } from '../compilers';
import { FileSystemDeployer } from '../deployers';
import { existsProm } from '../utils';
import { Lede } from '../lede';


export async function buildCommand(args, workingDir) {
  let name = args['n'] || args['name'];
  
  if (args['h'] || args['help']) {

  }

  let deploySettings = await getDeployPath(workingDir, name);
  let project = new Lede({
    js: new Es6Compiler(),
    css: new SassCompiler(),
    html: new NunjucksCompiler()
  });
  try {
    let deployer = new FileSystemDeployer(deploySettings.output);
    await project.deployProject(deploySettings.projPath, deployer);
  } catch(e) {
    console.log(e)
  }
  console.log(`Built project at ${chalk.green(deploySettings.output)}`)
}


async function getDeployPath(path, name) {
  if (!name) {
    try {
      let res = await existsProm(`${process.cwd()}/projectSettings.js`);
      if(res.file) {
        let projName = process.cwd().split('/')[process.cwd().split('/').length - 1];
        return {
          projPath: process.cwd(),
          output: `${path}/.builtProjects/${projName}`
        }
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(`Cannot find project. Please specify a ${chalk.blue('-n [name]')} option or change into a project directory. Type ${chalk.blue('lede build -h')} for help`);
        process.exit(1);
      } else {
        console.error(e);
        process.exit(1);
      }
    }
  } else {
    try {
      let res = await existsProm(`${path}/${name}/projectSettings.js`);
      if (res.file) {
        return {
          projPath: `${path}/${name}`,
          output: `${path}/.builtProjects/${name}`
        }
      }
    } catch (e) {
      if (e.code === 'ENOENT') {
        console.log(`${chalk.red(`${path}/${name}`)} is not a lede project`)
      }
    }
    
  }
}