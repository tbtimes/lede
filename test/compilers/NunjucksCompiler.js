import { test } from 'ava';
import { resolve } from 'path';
import { readFileSync, writeFileSync } from 'fs-extra';
import * as rmrf from 'rimraf';
import { NunjucksCompiler } from '../../dist/compilers'

import { CacheBuilder } from "../../dist/lede"

let projectReport = {
  workingDirectory: resolve(__dirname, "..", "fixtures"),
  context: {
    seo: {
    meta: [
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        content: 'IE=edge',
        props: [
          {
            prop: 'http-equiv',
            val: 'X-UA-Compatible'
          }
        ],
      },
      {
        props: [
          {
            prop: 'charset',
            val: 'UTF-8'
          }
        ],
      },
      {
        name: 'description',
        content: 'Starter lede project',
      },
    ],
    title: "Default lede project"
  },
    content: {
      ARTICLE: [
        {tmpl: 'proj3/text', text: 'hello'},
        {tmpl: 'proj3/text', text: 'cruel'},
        {tmpl: 'proj3/text', text: 'world'},
      ]
    }
  },
  dependencies: [
    {
      workingDir: resolve(__dirname, "..", "fixtures", "projects", "proj5"),
      name: 'proj5',
      dependsOn: [],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects")
    },
    {
      workingDir: resolve(__dirname, "..", "fixtures", "projects", "proj3"),
      name: 'proj3',
      dependsOn: ['proj5'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects")
    },
    {
      workingDir: resolve(__dirname, "..", "fixtures", "projects", "proj4"),
      name: 'proj4',
      dependsOn: ['proj3', 'proj5'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects")
    },
    {
      workingDir: resolve(__dirname, "..", "fixtures", "projects", "proj2"),
      name: 'proj2',
      dependsOn: ['proj4'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects")
    },
    {
      workingDir: resolve(__dirname, "..", "fixtures", "projects", "proj1"),
      name: 'proj1',
      dependsOn: ['proj2'],
      scripts: [],
      styles: [],
      blocks: [],
      assets: [],
      googleFileId: '',
      inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects")
    },
  ],
  styles: [],
  scripts: [],
  blocks: ['proj4/baz.html', 'ARTICLE']
};

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

test.before("Create .ledeCache", async t => {
  await CacheBuilder.buildDepCache(projectReport.dependencies, resolve(__dirname, '../fixtures/.ledeCache'))
});

test.after.cb("Remove .ledeCache", t => {
  rmrf.default(resolve(__dirname, "../fixtures/.ledeCache"), t.end)
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
  let compiledPage = await compiler.compile(projectReport, {css: fakeCompiler, js: fakeCompiler})
  t.deepEqual(compiledPage, {
    index: compiledIndex,
    scripts: expectedScriptsBlock,
    styles: expectedStylesBlock,
    cachePath: resolve(__dirname, "..", "fixtures", ".ledeCache")
  })
});