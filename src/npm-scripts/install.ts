#!/usr/bin/env node

import { homedir } from 'os';
import { resolve } from 'path';
import { exec } from 'child_process';
import { npmInstall } from '../utils'

import { createDir, copyProm } from '../utils';


let ledeHome = process.env.LEDE_HOME ? resolve(homedir(), process.env.LEDE_HOME) : resolve(homedir(), "LedeProjects");

async function build() {
  await createDir(ledeHome);
  await createDir(resolve(ledeHome, "compilers"));
  await createDir(resolve(ledeHome, 'logs'));

  var coreDir = resolve(__dirname, "..", "..", "templates", "core");
  let compilersDir = resolve(ledeHome, "compilers");
  await copyProm(coreDir, resolve(ledeHome, 'core'));
  await copyProm(resolve(__dirname, "..", "..", "templates", "compilerConfig.js"), resolve(compilersDir, "compilerConfig.js"));
  await copyProm(resolve(__dirname, "..", "..", "dist", "compilers", "NunjucksCompiler.js"), resolve(compilersDir, "NunjucksCompiler.js"));
  await copyProm(resolve(__dirname, "..", "..", "dist", "compilers", "SassCompiler.js"), resolve(compilersDir, "SassCompiler.js"));
  await copyProm(resolve(__dirname, "..", "..", "dist", "compilers", "Es6Compiler.js"), resolve(compilersDir, "Es6Compiler.js"));
}
build();
