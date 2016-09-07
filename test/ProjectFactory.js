import { test } from "ava";
import { join } from "path";

import { ProjectFactory } from "../dist/ProjectFactory";
import { Project, Bit, Page } from "../dist/models";

const testProjPath = join(__dirname, "fixtures", "test-project");
const testBitPath = join(__dirname, "fixtures", "test-project", "bits", "test-bit");
const testPagePath = join(__dirname, "fixtures", "test-project", "pages");

test("Static getProject method should return an instantiated Project.", async t => {
  const proj = await ProjectFactory.getProject(testProjPath);
  const expected = {
    name: "tester",
    deployRoot: "some/root/directory",
    defaults: { materials: [], metaTags: [], blocks: [] },
    compilers: {
      html: { compilerClass: {}, constructorArg: {} },
      style: { compilerClass: {}, constructorArg: {} },
      script: { compilerClass: {}, constructorArg: {} },
    },
    context: { baz: "qux" }
  };


  t.true(proj instanceof Project, "Should return an instance of Project.");
  t.deepEqual(proj, expected, "Should be correctly instantiated.")
});

test("Static getBit method should return an instantiated Bit.", async t => {
  const bit = await ProjectFactory.getBit(testBitPath);
  const expected = {
    version: 0,
    name: "testBit",
    context: { foo: "bar" },
    script: "test.js",
    style: "test.scss",
    html: "test.html"
  };
  t.true(bit instanceof Bit, "Should return an instance of Bit.");
  t.deepEqual(bit, expected, "Should be correctly instantiated.")
});

test("Static getPages method should return an array of instantiated Pages.", async t => {
  const pages = await ProjectFactory.getPages(testPagePath);
  const expectedBase = {
    blocks: [],
    meta: [],
    materials: { styles: [], scripts: [], assets: [] },
    resources: { head: [], body: [] }
  };

  t.true(pages[0] instanceof Page && pages[1] instanceof Page, "Pages should be instances of Page.");
  t.deepEqual(pages[0], Object.assign({}, expectedBase, { deployPath: "pageOne/should/deploy/here" }), "Page1 should instantiate correctly");
  t.deepEqual(pages[1], Object.assign({}, expectedBase, { deployPath: "pageTwo/should/deploy/here" }), "Page2 should instantiate correctly");
});

test.only("FJFJFJF", async t => {
  const pf = new ProjectFactory(testProjPath);
  return pf.buildReport()
});