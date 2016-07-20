import { test } from 'ava';
import { resolve } from 'path';
import * as rmrf from 'rimraf';
import { CacheBuilder } from '../../dist/lede';
import { createDir, globProm, existsProm } from '../../dist/utils';


let buildDir = resolve(__dirname, '../../cacheTestTmp');
let p1SettingsArr = [
  {
    workingDir: resolve(__dirname, "../fixtures/projects/proj5"),
    name: 'proj5',
    dependsOn: [],
    scripts: [],
    styles: [],
    blocks: [],
    assets: [],
    googleFileId: '',
    inheritanceRoot: resolve(__dirname, "../fixtures/projects")
  },
  {
    workingDir: resolve(__dirname, "../fixtures/projects/proj3"),
    name: 'proj3',
    dependsOn: ['proj5'],
    scripts: [],
    styles: [],
    blocks: [],
    assets: [],
    googleFileId: '',
    inheritanceRoot: resolve(__dirname, "../fixtures/projects")
  },
  {
    workingDir: resolve(__dirname, "../fixtures/projects/proj4"),
    name: 'proj4',
    dependsOn: ['proj3', 'proj5'],
    scripts: [],
    styles: [],
    blocks: [],
    assets: [],
    googleFileId: '',
    inheritanceRoot: resolve(__dirname, "../fixtures/projects")
  },
  {
    workingDir: resolve(__dirname, "../fixtures/projects/proj2"),
    name: 'proj2',
    dependsOn: ['proj4'],
    scripts: [],
    styles: [],
    blocks: [],
    assets: [],
    googleFileId: '',
    inheritanceRoot: resolve(__dirname, "../fixtures/projects")
  },
  {
    workingDir: resolve(__dirname, "../fixtures/projects/proj1"),
    name: 'proj1',
    dependsOn: ['proj2'],
    scripts: [],
    styles: [],
    blocks: [],
    assets: [],
    googleFileId: '',
    inheritanceRoot: resolve(__dirname, "../fixtures/projects")
  },
];

test.beforeEach("Ensure testing directory", t => {
  return createDir(buildDir)
});

test.afterEach.cb("Clean testing directory", t => {
  rmrf.default(buildDir, () => t.end())
});

test.serial("CacheBuilder.createCache", async t => {
  await CacheBuilder.createCache(p1SettingsArr, buildDir);

  let bins = await globProm('*', buildDir);
  t.deepEqual(bins, ['assets', 'bits', 'blocks', 'scripts', 'styles']);

  for (let bin of bins) {
    let projs = await globProm(`*`, resolve(buildDir, bin));
    t.deepEqual(projs, ['proj1', 'proj2', 'proj3', 'proj4', 'proj5']);
  }
});

test.serial("CacheBuilder.buildDepCache", async t => {
  await CacheBuilder.buildDepCache(p1SettingsArr, buildDir);

  let assetTest = await existsProm(resolve(buildDir, 'assets', 'proj5', 'sleepyTiger.jpg'));
  let styleTest = await existsProm(resolve(buildDir, 'styles', 'proj1', 'foo.scss'));
  let scriptsTest = await existsProm(resolve(buildDir, 'scripts', 'proj2', 'bar.js'));
  let bitsTest = await existsProm(resolve(buildDir, 'bits', 'proj3', 'text'));

  t.true(assetTest.file);
  t.true(styleTest.file);
  t.true(scriptsTest.file);
  t.true(bitsTest.dir);
});