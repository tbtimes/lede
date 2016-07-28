import { test } from 'ava';
import { resolve } from 'path';
import { readFileSync, ensureDir, rmdir } from 'fs-extra';
import { copyProm, globProm, existsProm, createDir, asyncMap, writeProm, readJsonProm} from '../dist/utils';
import * as rmrf from 'rimraf';

let testFilePath = resolve(__dirname, 'fixtures', 'rendered', 'testfile.txt');
let testJsonPath = resolve(__dirname, 'fixtures', 'rendered', 'testjson.json');
let tmpdir = resolve(__dirname, 'fixtures', 'tmp', 'utils');

test.before.cb("Create tmp dir", t => {
  ensureDir(resolve(__dirname, 'fixtures', 'tmp', 'utils'), t.end);
});

test.after.cb("Delete tmp dir", t => {
  rmrf.default(resolve(__dirname, 'fixtures', 'tmp', 'utils'), t.end);
});

test("Utils.copyProm", async t => {
  await copyProm(testFilePath, resolve(tmpdir, 'testfile.txt'));
  let testFile = readFileSync(resolve(tmpdir, 'testfile.txt')).toString();
  t.deepEqual(testFile, "THIS IS A TEST");
});

test("Utils.globProm", async t => {
  let globbed = await globProm('*', resolve(__dirname, 'fixtures', 'projects'));
  let expected = ['circ1', 'circ2', 'proj1', 'proj2', 'proj3', 'proj4', 'proj5'];
  t.deepEqual(globbed, expected);
});

test("Utils.existsProm", async t => {
  let file = await existsProm(resolve(__dirname, 'fixtures', 'rendered', 'index.html'));
  t.true(file.file);
  t.false(file.dir);
  let dir = await existsProm(resolve(__dirname));
  t.true(dir.dir);
  t.false(dir.file);
});

test("Utils.createDir", async t => {
  await createDir(resolve(__dirname, 'fixtures', 'tmp', 'utils', 'testDir'));
  let dir = await existsProm(resolve(__dirname, 'fixtures', 'tmp', 'utils', 'testDir'));
  t.true(dir.dir);
});

test("Utils.asyncMap", async t => {
  let nums = [1,2,3,4,5];
  let mapped = await asyncMap(nums, x => x * 2);
  t.deepEqual(mapped, nums.map(x => x * 2));
});

test("Utils.writeProm", async t => {
  await writeProm("TEST", resolve(__dirname, 'fixtures', 'tmp', 'utils', 'writeProm.txt'));
  let contents = readFileSync(resolve(__dirname, 'fixtures', 'tmp', 'utils', 'writeProm.txt')).toString();
  t.deepEqual(contents, "TEST");
});

test("Utils.readJsonProm", async t => {
  let contents = await readJsonProm(resolve(__dirname, 'fixtures', 'rendered', 'testjson.json'));
  t.deepEqual(contents, {test: "this is a test"})
});