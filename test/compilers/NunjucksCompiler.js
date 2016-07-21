import { test } from 'ava';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs-extra';
import * as rmrf from 'rimraf';
import { NunjucksCompiler } from '../../dist/compilers'

import { CacheBuilder } from "../../dist/lede"
import projectReport from "../fixtures/projectReport";

let fakeCompiler = {
  compile: function() {
    return new Promise((resolve, reject) => {
      resolve({ globals: "globals", bits: "bits"})
    });
  }
};

let expectedScriptsBlock = {file:"globalScripts.js",data:"\n// GLOBALS\nglobals\n// BITS\nbits\n"};
let expectedStylesBlock = {file:"globalStyles.css",data:"\n/* GLOBALS */\nglobals\n/* BITS */\nbits\n"};
let compiledShell = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "shell.html")).toString();
let compiledIndex = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "index.html")).toString();
let pathToCache = resolve(__dirname, "..", "fixtures", "tmp", "nunjuckscompiler", ".ledeCache");

projectReport.workingDirectory = resolve(pathToCache, "..");

test.before("Create .ledeCache", async t => {
  await CacheBuilder.buildDepCache(projectReport.dependencies, pathToCache)
});

test.after.cb("Remove .ledeCache", t => {
  rmrf.default(resolve(__dirname, "..", "fixtures", "tmp", "nunjuckscompiler", ".ledeCache"), t.end)
});

test("NunjucksCompiler.createScriptsBlock", async t => {
  let compiledScripts = await NunjucksCompiler.createScriptsBlock(projectReport, [], fakeCompiler);
  t.deepEqual(compiledScripts, expectedScriptsBlock)
});

test("NunjucksCompiler.createStyleBlock", async t => {
  let compiledStyles = await NunjucksCompiler.createStyleBlock(projectReport, [], fakeCompiler);
  t.deepEqual(compiledStyles, expectedStylesBlock)
});

test("NunjucksCompiler.getUsedBits", async t => {
  let bits = await NunjucksCompiler.getUsedBits(projectReport);
  t.deepEqual(bits, ['proj3/text'])
});

test("NunjucksCompiler.createShell", async t => {
  let shell = await NunjucksCompiler.createShell(projectReport, expectedStylesBlock, expectedScriptsBlock);
  t.deepEqual(shell, compiledShell);
});

test("NunjucksCompiler.renderTemplate", async t => {
  let index = await NunjucksCompiler.renderTemplate(projectReport, compiledShell);
  t.deepEqual(index, compiledIndex);
});

test("NunjucksCompiler.compile", async t => {
  let compiler = new NunjucksCompiler();
  let compiledPage = await compiler.compile(projectReport, {css: fakeCompiler, js: fakeCompiler});
  t.deepEqual(compiledPage, {
    index: compiledIndex,
    scripts: expectedScriptsBlock,
    styles: expectedStylesBlock,
    cachePath: resolve(__dirname, "..", "fixtures", "tmp", "nunjuckscompiler", ".ledeCache")
  })
});