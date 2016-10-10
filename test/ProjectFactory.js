import { test } from "ava";
import { join } from "path";
import { writeFileSync } from "fs";


import { ProjectFactory } from "../dist/ProjectFactory";
import { mockLogger } from "../dist/utils";
import { Es6Compiler } from "../dist/compilers/Es6Compiler";

const testProjPath = join(__dirname, "fixtures", "test-project");
const testBitPath = join(__dirname, "fixtures", "test-project", "bits", "test-bit");
const testPagePath = join(__dirname, "fixtures", "test-project", "pages");
const testBlockPath = join(__dirname, "fixtures", "test-project", "blocks");
const escomp = new Es6Compiler();

function writeJSON(filename, obj) {
  writeFileSync(filename, JSON.stringify(obj, null, 2));
}

test.only("t", async(t) => {
  const proj = await ProjectFactory.getProject(testProjPath, mockLogger );
  const bits = await ProjectFactory.getBits(testProjPath, "lede_modules", mockLogger );
  const pages = await ProjectFactory.getPages(testPagePath, mockLogger);
  const blocks = await ProjectFactory.getBlocks(testBlockPath, mockLogger);
  const mats = await ProjectFactory.getMaterials(testProjPath, "lede_modules", mockLogger);
  const tree = await ProjectFactory.buildProjectModel(testProjPath, "lede_moduels", mockLogger);
  await escomp.compile(tree);
  writeJSON("proj.json", proj);
  writeJSON("bits.json", bits);
  writeJSON("pages.json", pages);
  writeJSON("blocks.json", blocks);
  writeJSON("mats.json", mats);
  writeJSON("tree.json", tree);
});