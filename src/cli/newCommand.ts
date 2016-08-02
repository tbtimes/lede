import * as chalk from "chalk";
import { resolve } from 'path';

import { globProm, copyProm, writeProm, existsProm } from "../utils";

export async function newCommand({ workingDir, args, logger }) {
  let type = args['_'][0];
  let name = args['_'][1];
  let contentSrc = args['c'] || args['content'] || "1kLHE2F-ydeTiQtnHKX4PhQy9oSLCTYS0CsoNr5zjx1c";

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
            makeSettings(name, contentSrc),
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

function makeSettings(name, fileId) {
  return `

class SettingsConfig {
  constructor() {
    this.name = "${name}";
    this.dependsOn = ["core"];
    this.styles = [];
    this.scripts = [];
    this.blocks = ["ARTICLE"];
    this.assets = [];
    this.googleFileId = "${fileId}";
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;`
}