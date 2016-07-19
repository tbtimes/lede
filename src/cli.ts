#!/usr/bin/env node
import { homedir } from "os";
import { resolve } from 'path';
import * as minimist from "minimist";
import * as chalk from 'chalk';

import { newCommand, lsCommand, cdCommand, devCommand } from './cli/';


let args = minimist(process.argv.slice(2));
let ledeHome = process.env.LEDE_HOME ? resolve(homedir(), process.env.LEDE_HOME) : resolve(homedir(), "LedeProjects");
handleCommand(args);

async function handleCommand(args) {
  let command = args["_"].shift();
  let workingDir = args['path'] || args['p'] || ledeHome;

  switch (command) {
    case 'new':
       await newCommand(args, workingDir);
       break;
    case 'ls':
      await lsCommand(args, workingDir);
      break;
    case 'cd':
      let res = await cdCommand(args, workingDir);
      if (!res.err) {
        console.log(res.data)
      }
      break;
    case 'dev':
    try {
      await devCommand(args, workingDir);
    } catch(e) {
      console.log(e)
    }
      
      break;
    default:
      console.log(`Command "${chalk.red(command)}" not recognized`);
      break;
  }
}