import { test } from "ava";
import { join } from "path";

const sander = require("sander");

import { ProjectFactory } from "../dist/ProjectFactory";
import { Project, Bit, Page, Block, Material } from "../dist/models";
import { AmlResolver } from "../dist/resolvers";
import { NunjucksCompiler, SassCompiler, Es6Compiler } from "../dist/compilers";

const testProjPath = join(__dirname, "fixtures", "test-project");
const testBitPath = join(__dirname, "fixtures", "test-project", "bits", "test-bit");
const testPagePath = join(__dirname, "fixtures", "test-project", "pages");
const testBlockPath = join(__dirname, "fixtures", "test-project", "blocks");

test("Static getProject method should return an instantiated Project.", async t => {
  const proj = await ProjectFactory.getProject(testProjPath);
  const expected = {
    name: "tester",
    deployRoot: "some/root/directory",
    defaults: { materials: [], metaTags: [], blocks: [] },
    compilers: {
      html: new NunjucksCompiler({}),
      style: new SassCompiler(),
      script: new Es6Compiler(),
    },
    context: { baz: "qux" }
  };

  t.true(proj instanceof Project, "Should return an instance of Project.");
  t.deepEqual(JSON.stringify(proj), JSON.stringify(expected), "Should be correctly instantiated.")
});

test("Static getBit method should return an instantiated Bit.", async t => {
  const bit = await ProjectFactory.getBit(testBitPath);
  const script = await (new Material({type: "script", location: join(testBitPath, "test.js")})).fetch();
  const style = await (new Material({type: "style", location: join(testBitPath, "test.scss")})).fetch();
  const html = await (new Material({type: "html", location: join(testBitPath, "test.html")})).fetch();
  const expected = {
    version: 0,
    name: "testBit",
    context: { foo: "bar" },
    script,
    style,
    html,
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
  const pageOne = Object.assign({}, expectedBase, { deployPath: "pageOne/should/deploy/here", blocks: ["header"], name: "testpage" });
  const pageTwo = Object.assign({}, expectedBase, { deployPath: "pageTwo/should/deploy/here", blocks: ["header", "article", "footer"], name: "testpage2" });

  pages.forEach(p => t.true(p instanceof Page));
  t.deepEqual(pages[0], pageOne, "Page1 should instantiate correctly");
  t.deepEqual(pages[1], pageTwo, "Page2 should instantiate correctly");
});

test("Static getBlocks method should return an array of instantiated blocks.", async t => {
  const blocks = await ProjectFactory.getBlocks(testBlockPath);
  const expectedBase = {
    bits: [
      { bit: "test-bit", context: { foo: "bar" } },
      { bit: "test-bit", context: { baz: "qux" } }
    ],
    source: new AmlResolver("1yET-AtSiVJ1L3R0YVt50GfBJHsq242-oltepsxO6FXQ", process.env.GAPI_KEY),
    context: {},
    template: '\n<div class="lede-block">\n  {% asyncAll $bit in $block.bits %}\n    {% BIT $bit %}\n  {% endall %}\n</div>\n'
  };
  const article = Object.assign({}, expectedBase, { name: "article" });
  const header = Object.assign({}, expectedBase, { name: "header" });
  const footer = Object.assign({}, expectedBase, { name: "footer" });
  blocks.forEach(b => t.true(b instanceof Block));
  t.deepEqual(blocks.find(x => x.name === "article"), article);
  t.deepEqual(blocks.find(x => x.name === "header"), header);
  t.deepEqual(blocks.find(x => x.name === "footer"), footer);
});

test("Public buildReport method should return a ProjectReport", async t => {
  const pf = new ProjectFactory({workingDir: testProjPath});
  const projectReport = await pf.buildReport();
  t.true(projectReport.project instanceof Project);
  t.true(projectReport.blocks[0] instanceof Block);
  t.true(projectReport.pages[0] instanceof Page);
  t.true(projectReport.bits[0] instanceof Bit);
  // const inspect = require('util').inspect;
  // sander.writeFileSync("report.txt", inspect(projectReport, {depth:Infinity}));
});