import { test } from 'ava';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs-extra';
import { CacheBuilder } from '../../dist/lede';
import { SassCompiler } from '../../dist/compilers/SassCompiler';
import projectReport from '../fixtures/projectReport';
import * as rmrf from 'rimraf';

let pathToCache = resolve(__dirname, "..", "fixtures", "tmp", "sasscompiler", ".ledeCache");

projectReport.workingDirectory = resolve(pathToCache, "..");
let options = {
  includePaths: [resolve(projectReport.workingDirectory, ".ledeCache", "styles")],
  outputStyle: 'compact',
  sourceComments: false,
  sourceMapEmbed: false
};

let expectedGlobalRender = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "globalSass.css")).toString();
let expectedBitsRender = readFileSync(resolve(__dirname, "..", "fixtures", "rendered", "bitsSass.css")).toString();
let expectedCompile = { globals: 'h1 { color: blue; }\n', bits: 'div { background-color: blue; }\n'};

test.before("Create .ledeCache", async t => {
  await CacheBuilder.buildDepCache(projectReport.dependencies, pathToCache);
});

test.after.cb("Remove .ledeCache", t => {
  rmrf.default(pathToCache, t.end);
});

test("SassCompiler.renderFile", async t => {
  let compiledSass = await SassCompiler.renderFile(options, resolve(pathToCache, "styles", "proj3", "includeTest.scss"));
  t.deepEqual(compiledSass, expectedGlobalRender);
});

test("SassCompiler.compileBits", async t => {
  let compiledBits = await SassCompiler.compileBits(projectReport, options, ["proj4/testSass"]);
  t.deepEqual(compiledBits, expectedBitsRender);
});

test("SassCompiler.compileGlobals", async t => {
  let compiledGlobals = await SassCompiler.compileGlobals(projectReport, options);
  t.deepEqual(compiledGlobals, expectedGlobalRender);
});

test("SassCompiler.compile", async t => {
  let sc = new SassCompiler(options);
  let output = await sc.compile(projectReport, ["proj4/testSass"]);
  t.deepEqual(output, expectedCompile);
});