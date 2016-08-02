import * as chalk from 'chalk';
import { resolve } from 'path';

import { existsProm } from "../utils";


export async function cdCommand({ workingDir, args, logger }) {
  let name = args['_'][0];
  if (args['h'] || args['help']) {
      console.log(`\n${chalk.blue('lede cd [name]')} is a helper command that returns a full path to project ${chalk.blue('name')}.
This command is meant to be used like so:
  cd \`${chalk.blue('lede cd myProject')}\`\n`)
  }
  try {
    let status = await existsProm(resolve(workingDir, name));
    if (!status.dir) {
      console.log(`${chalk.red(`${workingDir}/${name}`)} is not a directory`)
    } else {
      console.log(resolve(workingDir, name));
    }
  } catch(e) {
    if (e.code !== 'ENOENT') {
      console.log(e);
    } else {
      console.log(`Project "${chalk.red(name)}" does not exist. See existing projects with the ${chalk.blue('lede ls')} command`)
    }
  }
  
  
}