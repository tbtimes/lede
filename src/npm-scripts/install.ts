#!/usr/bin/env node

import { homedir } from 'os';
import { createDir } from '../utils';


let ledeHome = process.env.LEDE_HOME ? process.env.LEDE_HOME : `${homedir()}/LedeProjects/`;

async function build() {
  await createDir(ledeHome);
  // Copy over base templates here
}
build()
