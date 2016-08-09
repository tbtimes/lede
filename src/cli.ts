#!/usr/bin/env node
import { homedir } from "os";
import { resolve } from "path";
import * as minimist from "minimist";
import * as chalk from "chalk";
import { newCommand, lsCommand, cdCommand, devCommand, makeLogger, imageCommand, stageCommand } from "./cli/commands";


let args = minimist(process.argv.slice(2));

handleCommand(args);

async function handleCommand(args) {
  let command = args["_"].shift();
  let ledeHome = process.env.LEDE_HOME ? resolve(homedir(), process.env.LEDE_HOME) : resolve(homedir(), "LedeProjects");

  let logger = makeLogger(args['path'] || args['p'] || ledeHome,
    args['log-level'] || args['l'] || "info"
  );

  let config = {
    gapiKey: process.env.GAPI_KEY,
    workingDir: args['path'] || args['p'] || ledeHome,
    args,
    logger
  };

  logger.debug({gapiKey: config.gapiKey, workingDir: config.workingDir});

  switch (command) {
    case 'new':
      await newCommand(config);
      break;
    case 'ls':
      await lsCommand(config);
      break;
    case 'cd':
      await cdCommand(config);
      break;
    case 'dev':
      await devCommand(config);
      break;
    case 'image':
    case 'images':
      await imageCommand(config);
      break;
    case 'stage':
    case 'staging':
      await stageCommand(config);
      break;
    default:
      console.error(`Command "${chalk.red(command)}" not recognized`);
      break;
  }
}