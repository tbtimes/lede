#!/usr/bin/env node
import { homedir } from "os";
import * as minimist from "minimist";
import * as chalk from 'chalk';

import { newCommand, lsCommand, cdCommand, buildCommand, devCommand } from './cli/';


let args = minimist(process.argv.slice(2));
const ledeHome = process.env.LEDE_HOME ? process.env.LEDE_HOME : `${homedir()}/LedeProjects`;
handleCommand(args);

async function handleCommand(args) {
  let command = args["_"].shift();
  let workingDir = args['path'] || args['p'] || ledeHome;

  switch (command) {
    case 'new':
      await newCommand(args, workingDir);
      process.exit(0);
      break;
    case 'ls':
      await lsCommand(args, workingDir);
      process.exit(0);
      break;
    case 'cd':
      let res = await cdCommand(args, workingDir);
      if (!res.err) {
        console.log(res.data)
      }
      process.exit(0);
      break;
    case 'build':
      await buildCommand(args, workingDir);
      process.exit(0);
      break;
    case 'dev':
      await devCommand(args, workingDir);
      break;
    default:
      console.log(`Command "${chalk.red(command)}" not recognized`);
      process.exit(0);
      break;
  }
}