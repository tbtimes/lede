#!/usr/bin/env node
import { homedir } from 'os';
import {} from 'fs-extra';
import * as cmd from 'commander';
import * as chalk from 'chalk';


const ledeHome = process.env.LEDE_HOME ? process.env.LEDE_HOME : `${homedir()}/LedeProjects`;

cmd.version('0.0.1');
   

cmd
  .command("new [type] [name]")
  .description("Create a new [project|bit] with [name]")
  .option("-p, --path [path]", "optionally a path to create the [project|bit]")
  .action(function (type, name, options) {
    let path = options.path || ledeHome;
    
    if (!type || !name) {
      console.log(chalk.red("[type] and [name] are required parameters") + " -- type lede new -h for help")
    } else {
      switch(type){
        case ('project'):
          break;
        case ('bit'):
          break;
        default:
          console.log(`${chalk.red(type)} is not a valid [type] param -- type lede new -h for help`)
      }
    }
  });

cmd.parse(process.argv);


