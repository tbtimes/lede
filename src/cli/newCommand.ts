import * as chalk from "chalk";
import { resolve } from 'path';

import { globProm, copyProm, writeProm, existsProm, npmInstall } from "../utils";

export async function newCommand(args, workingDir) {
  let type = args['_'][0];
  let name = args['_'][1];
  let contentSrc = args['c'] || args['content'] || "1PokALcLuibzWcgOyLVCSpWvIrr9myRN-hH1IMxKE4EI";
  let apiKey = args['a'] || args['api'] || process.env.GAPI_KEY

  // Check for help/all args present
  if (args['h'] || args['help']) {
    console.log(
      `\n${chalk.blue("lede new [type] [name]")}
${chalk.blue('lede new')} creates a new entity of type ${chalk.blue('[type]')} with name ${chalk.blue('[name]')}
Valid types: project|bit
Options: -p --path
  Directory where ${chalk.blue(
        'lede new')} should create the new type. Defaults to env var LEDE_HOME, falls back to '~/LedeProjects'\n`
    );
    return;
  }
  if (!type || !name) {
    console.log(`${chalk.red('[type]')} and ${chalk.red('[name]')} are required parameters -- type ${chalk.blue(
      'lede new -h')} for help`);
    return;
  }
  if (!apiKey) {
    console.log(chalk.red("You must have a google api key to create a lede project. You can pass it in with the -a flag or set it to GAPI_KEY environment variable"));
    process.exit(1);
  }

  // Creation logic
  switch (type.toLowerCase()) {
    case 'project':
      let pathToCreate = resolve(workingDir, args['_'][1]);
      let paths = await globProm(`${workingDir}/*`);
      if (paths.indexOf(pathToCreate) > -1) {
        console.log(
          `Project "${chalk.red(name)}" already exists. Use ${chalk.blue('lede ls')} to see all projects.`);
        break;
      } else {
        try {
          console.log("Creating project");
          await copyProm(resolve(__dirname, '../..', 'templates/project'), resolve(workingDir, name));
          await writeProm(
            makeSettings(name, "process.env.LEDE_HOME ? path.resolve(os.homedir(), process.env.LEDE_HOME) : path.resolve(os.homedir(), \"LedeProjects\");", contentSrc, apiKey), 
            resolve(workingDir, name, 'projectSettings.js')
         );
          console.log(`Created ${chalk.green(resolve(workingDir, name))}`)
        } catch(e) {
          console.log(e)
        }
      }
      break;
    case 'bit':
      try {
        let status = await existsProm(resolve(process.cwd(), 'projectSettings.js'))
        if (status.file) {
          await copyProm(resolve(__dirname, '../../templates/bit'), resolve(process.cwd(), 'bits', name))
        }
      } catch (e) {
        if (e.code !== 'ENOENT') {
          console.log(e)
        } else {
          console.log(
`${chalk.blue('lede new bit [name]')} should be run from inside a Lede Project. Use the ${chalk.blue('lede cd')} command to change to a project directory`
          )
        }
      }
      break;
    default:
      console.log(`${chalk.red(type)} is not a valid ${chalk.red('[type]')} param -- type ${chalk.blue('lede new -h')} for help`)

  }
}

function makeSettings(name, inheritanceRoot, fileId, apiKey) {
  return `const path = require('path');
const fs = require('fs');
const os = require('os');

class SettingsConfig {
  constructor() {
    this.name = "${name}";
    this.inheritanceRoot = ${inheritanceRoot};
    this.dependsOn = ["core"];
    this.contentResolver = null;
    this.styles = [];
    this.scripts = [];
    this.blocks = ["BITLOOP"];
    this.assets = [];
    this.contentResolver = {
      apiKey: "${apiKey}",
      fileId: "${fileId}",
      parseFn: null
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;`
}