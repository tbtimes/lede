import * as chalk from 'chalk';

import { existsProm } from "../utils";


export async function cdCommand(args, workingDir) {
  let name = args['_'][0];
  if (args['h'] || args['help']) {
    return {
      err: null,
      data: `\n${chalk.blue('lede cd [name]')} is a helper command that returns a full path to project ${chalk.blue('name')}.
This command is meant to be used like so:
  cd \`${chalk.blue('lede cd myProject')}\`\n`
    }
  }
  try {
    let status = await existsProm(`${workingDir}/${name}`);
    if (!status.dir) {
      console.log(`${chalk.red(`${workingDir}/${name}`)} is not a directory`)
      return {err: true}
    } else {
      return {err: null, data: `${workingDir}/${name}`};
    }
  } catch(e) {
    if (e.code !== 'ENOENT') {
      console.log(e);
      return {err: true}
    } else {
      console.log(`Project "${chalk.red(name)}" does not exist. See existing projects with the ${chalk.blue('lede ls')} command`)
      return {err: true}
    }
  }
  
  
}