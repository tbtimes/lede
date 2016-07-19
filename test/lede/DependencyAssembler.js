import { test } from 'ava';
import { resolve } from 'path';
import { DependencyAssembler } from '../../dist/lede/DependencyAssembler';

let pathToRootDep = resolve(__dirname, "../fixtures/projects/proj1");

test("DependencyAssembler.buildDependencies", async t => {
  let deps = await DependencyAssembler.buildDependencies(pathToRootDep);
  t.deepEqual(deps.map(x => x.name), ["proj5", "proj4", "proj3", "proj2", "proj1"])
});