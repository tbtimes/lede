#!/usr/bin/env node

import { homedir } from 'os';
import { resolve } from 'path';
import { exec } from 'child_process';
import { npmInstall } from '../utils'

import { createDir, copyProm } from '../utils';


let ledeHome = process.env.LEDE_HOME ? process.env.LEDE_HOME : `${homedir()}/LedeProjects/`;

async function build() {
  await createDir(ledeHome);
  // Copy over base templates here
  var coreDir = resolve(__dirname, '../../templates/core');
  await copyProm(coreDir, `${ledeHome}/core`)
  await npmInstall(coreDir)
    
}
build();
