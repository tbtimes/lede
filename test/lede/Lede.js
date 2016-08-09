import { test } from 'ava';
import { Lede } from '../../dist/lede/Lede';
import { resolve } from 'path';
import { createDir, existsProm } from '../../dist/utils';
import * as rmrf from 'rimraf';
import Es6Compiler from '../../dist/compilers/Es6Compiler';
import NunjucksCompiler from '../../dist/compilers/NunjucksCompiler';
import SassCompiler from '../../dist/compilers/SassCompiler';
import { FileSystemDeployer } from '../../dist/deployers/FileSystemDeployer';
import projectReport from "../fixtures/projectReport";
import { spy } from 'sinon';

let deployPath = resolve(__dirname, "..", "fixtures", "tmp", "lede", "deploy");
let workingDir = resolve(__dirname, "..", "fixtures", "projects", "proj1");
let getCompiledPage = require(resolve(__dirname, '..', 'fixtures', 'rendered', 'compiledPage.js')).getCompiledPage;
let logger = {info:()=>{}, debug:()=>{}, trace:()=>{},error:()=>{},fatal:()=>{}};
let compilers = {
  html: new NunjucksCompiler(),
  css: new SassCompiler(),
  js: new Es6Compiler()
};
let deployers = {dev: new FileSystemDeployer(deployPath)};

// Resetting these because they add complexity and are tested in our compiler tests anyway
projectReport.workingDirectory = workingDir;
projectReport.scripts = [];
projectReport.styles = [];
projectReport.blocks = [];
projectReport.context.content = {};
projectReport.context.$projectName = "proj1";
// projectReport.context.$debug =


test.before("Create deploy dir", async t => {
  await createDir(deployPath)
});

test.after.cb("Remove deploy dir", t => {
  rmrf.default(deployPath, () => {
    rmrf.default(resolve(__dirname, '..', 'fixtures', 'projects', 'proj1', '.ledeCache'), () => {
      rmrf.default(resolve(__dirname, '..', '..', 'ledeHome'), t.end)
    })
  });
});

test.serial("Lede.assembleDeps", async t => {
  let assembledDeps = await Lede.assembleDeps(workingDir, logger);
  t.deepEqual(assembledDeps, projectReport);
});

test.serial("Lede.buildCache", async t => {
  await Lede.buildCache(projectReport, logger);
  let buildDir = resolve(workingDir, '.ledeCache');
  let assetTest = await existsProm(resolve(buildDir, 'assets', 'proj5', 'sleepyTiger.jpg'));
  let styleTest = await existsProm(resolve(buildDir, 'styles', 'proj1', 'foo.scss'));
  let scriptsTest = await existsProm(resolve(buildDir, 'scripts', 'proj2', 'bar.js'));
  let bitsTest = await existsProm(resolve(buildDir, 'bits', 'proj3', 'text'));
  let blocksTest = await existsProm(resolve(buildDir, 'blocks', 'proj4', 'baz.html'));

  t.true(assetTest.file);
  t.true(styleTest.file);
  t.true(scriptsTest.file);
  t.true(bitsTest.dir);
  t.true(blocksTest.file);
});

// TODO: Find bug that makes this test fail when it is the only test that runs.
test.serial("Lede.compilePage", async t => {
  let compPage = await Lede.compilePage(compilers, projectReport, logger);
  let expected = getCompiledPage(projectReport.workingDirectory);
  t.deepEqual(compPage.index, expected.index);
  t.deepEqual(compPage.scripts, expected.scripts);
  t.deepEqual(compPage.styles, expected.styles);
  t.deepEqual(compPage.cachePath, expected.cachePath);

  // Should error
  await Lede.compilePage(compilers, "junk", logger);
  // check error spy
});

test.serial("Lede.deployPage", async t => {
  await Lede.deployPage(deployers.dev, projectReport, getCompiledPage(projectReport.workingDirectory), logger);
  let assetTest = await existsProm(resolve(deployPath, 'assets', 'proj5', 'sleepyTiger.jpg'));
  let indexTest = await existsProm(resolve(deployPath, 'index.html'));
  let scriptsTest = await existsProm(resolve(deployPath, 'globalScripts.js'));
  let stylesTest = await existsProm(resolve(deployPath, 'globalStyles.css'));

  t.true(assetTest.file);
  t.true(indexTest.file);
  t.true(scriptsTest.file);
  t.true(stylesTest.file);
});

test.serial("Lede.deploy", async t => {
  let lede = new Lede(workingDir, compilers, deployers, logger);
  let pr = await lede.deploy("dev", false);

  t.deepEqual(pr, projectReport);
  let assetTest = await existsProm(resolve(deployPath, 'assets', 'proj5', 'sleepyTiger.jpg'));
  let indexTest = await existsProm(resolve(deployPath, 'index.html'));
  let scriptsTest = await existsProm(resolve(deployPath, 'globalScripts.js'));
  let stylesTest = await existsProm(resolve(deployPath, 'globalStyles.css'));

  t.true(assetTest.file);
  t.true(indexTest.file);
  t.true(scriptsTest.file);
  t.true(stylesTest.file);

  let pr2 = await lede.deploy('dev', true, pr);
  let projectReport2 = JSON.parse(JSON.stringify(projectReport));
  projectReport2.context.$debug = true;
  t.deepEqual(pr2, projectReport2);
});