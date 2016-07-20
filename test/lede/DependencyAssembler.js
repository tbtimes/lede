import { test } from 'ava';
import { resolve } from 'path';
import { DependencyAssembler } from '../../dist/lede';
import { CircularDepError } from '../../dist/errors';

let pathToProj1 = resolve(__dirname, "..", "fixtures", "projects", "proj1");
let pathToCirc1 = resolve(__dirname, "..", "fixtures", "projects", "circ1");
let p1NodeReport = {
  node: pathToProj1,
  settings: {
    inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects"),
    name: 'proj1',
    dependsOn: ['proj2'],
    scripts: [],
    blocks: [],
    styles: [],
    assets: [],
    googleFileId: '',
    workingDir: pathToProj1
  },
  leaves: [ resolve(__dirname, "..", "fixtures", "projects", "proj2") ]
};
let p1SettingsArr = [
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
];

let expectedContext = {
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
  }
};

test("DependencyAssembler.buildDependencies", async t => {
  let deps = await DependencyAssembler.buildDependencies(pathToProj1);
  t.deepEqual(deps.map(x => x.name), ["proj5", "proj3", "proj4", "proj2", "proj1"]);

  t.throws(DependencyAssembler.buildDependencies(pathToCirc1), pathToCirc1);
});

test("DependencyAssembler.reportOnDep", async t => {
  let nodeReport = await DependencyAssembler.reportOnDep(pathToProj1);
  t.deepEqual(nodeReport, p1NodeReport);
});

test("DependencyAssembler.followLeaves", async t => {
  let settings = await DependencyAssembler.followLeaves(p1NodeReport, [], []);
  t.deepEqual(settings, p1SettingsArr);

  let circular = await DependencyAssembler.reportOnDep(pathToCirc1);
  t.throws(DependencyAssembler.followLeaves(circular, [], []), pathToCirc1);
});

test("DependencyAssembler.gatherContext", async t => {
  let ctx = await DependencyAssembler.gatherContext(pathToProj1);
  t.deepEqual(ctx, expectedContext);

  ctx = await DependencyAssembler.gatherContext(pathToCirc1);
  t.deepEqual(ctx, {});
  t.throws(DependencyAssembler.gatherContext(resolve(__dirname, "..", "fixtures"),
                                             new CircularDepError(resolve(__dirname, "..", "fixtures", "baseContext.js"))))
});

test("DependencyAssembler.gatherSettings", async t => {
  let settings = await DependencyAssembler.gatherSettings(pathToProj1);
  t.deepEqual(settings, {
    inheritanceRoot: resolve(__dirname, "..", "fixtures", "projects"),
    name: 'proj1',
    dependsOn: ['proj2'],
    scripts: [],
    blocks: [],
    styles: [],
    assets: [],
    googleFileId: ''
  });

  t.throws(DependencyAssembler.gatherSettings(resolve(__dirname, "..", "fixtures"),
                                              new CircularDepError(resolve(__dirname, "..", "fixtures", "projectSettings.js"))))
});

test("DependencyAssembler.buildContext", async t => {
  let ctx = await DependencyAssembler.buildContext(p1SettingsArr);
  t.deepEqual(ctx, expectedContext)
});