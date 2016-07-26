#!/usr/bin/env node
import * as browserify from 'browserify';
import * as babelify from 'babelify';
import { homedir } from 'os';
import { resolve } from 'path';
import { writeFile } from 'fs-extra';
import { exec } from 'child_process';

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

  console.log("Installing dependencies ... this may take a few minutes");

  await execProm("npm install fs-extra node-sass nunjucks browserify babelify glob babel-preset-es2015 slug", {
    cwd: compilersDir
  })

}

async function execProm(cmd, opts) {
  return new Promise((resolve, reject) => {
    exec(cmd, opts, (err, stdout, stderr) => {
      if (err) reject(err);
      resolve(stdout);
    })
  });
}

build();
