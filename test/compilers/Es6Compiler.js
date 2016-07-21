import { test } from 'ava';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs-extra';
import { CacheBuilder } from '../../dist/lede';
import { Es6Compiler } from '../../dist/compilers';
import projectReport from '../fixtures/projectReport';
import * as rmrf from 'rimraf';

let pathToCache = resolve(__dirname, "..", "fixtures", "tmp", "es6compiler", ".ledeCache");
let expectedRequirable = [
  {file: resolve(pathToCache, "scripts", "proj2", "bar.js"), expose: 'proj2/bar.js'},
  {file: resolve(pathToCache, "scripts", "proj5", "globalScript.js"), expose: "proj5/globalScript.js"}
];
let expectedBits = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "bundledJSBits.js")).toString();
let expectedGlobals = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "bundledJSGlobals.js")).toString();

projectReport.workingDirectory = resolve(pathToCache, "..");

test.before("Create .ledeCache", async t => {
  await CacheBuilder.buildDepCache(projectReport.dependencies, pathToCache);
});

test.after.cb("Remove .ledeCache", t => {
  rmrf.default(resolve(__dirname, "../fixtures/.ledeCache"), t.end);
});

test("Es6Compiler.getRequirablePaths", async t => {
  let paths = await Es6Compiler.getRequirablePaths(resolve(pathToCache, "scripts"));
  t.deepEqual(paths, expectedRequirable);
});

test("Es6Compiler.bundleBits", async t => {
  let bundledBits = await Es6Compiler.bundleBits(projectReport, expectedRequirable, ["proj2/loadjs"]);
  t.deepEqual(bundledBits, expectedBits);
});

test("Es6Compiler.bundleGlobals", async t => {
  let bundledGlobals = await Es6Compiler.bundleGlobals(projectReport, expectedRequirable);
  t.deepEqual(bundledGlobals, expectedGlobals);
});