import { test } from "ava";
import { join } from "path";
import { writeFileSync } from "fs";


import { ProjectFactory } from "../dist/ProjectFactory";
import { mockLogger } from "../dist/utils";
import { Es6Compiler } from "../dist/compilers/Es6Compiler";
import { SassCompiler } from "../dist/compilers/SassCompiler";
import { NunjucksCompiler } from "../dist/compilers/NunjucksCompiler";
import { FileSystemDeployer } from "../dist/deployers/FileSystemDeployer";
import { ProjectDirector } from "../dist/ProjectDirector";

const testProjPath = join(__dirname, "fixtures", "test-project");
const testBitPath = join(__dirname, "fixtures", "test-project", "bits", "test-bit");
const testPagePath = join(__dirname, "fixtures", "test-project", "pages");
const testBlockPath = join(__dirname, "fixtures", "test-project", "blocks");
const escomp = new Es6Compiler();
const sasscomp = new SassCompiler();
const njkcomp = new NunjucksCompiler();
const deployer = new FileSystemDeployer({workingDir: join(__dirname, "fixtures")});
const pf = new ProjectFactory({workingDir: testProjPath, logger: mockLogger, depCacheDir: "lede_modules"});
const director = new ProjectDirector({ projectFactory: pf, workingDir: testProjPath, logger: mockLogger, deployer, htmlCompiler: njkcomp, styleCompiler: sasscomp, scriptCompiler: escomp})

function writeJSON(filename, obj) {
  writeFileSync(filename, JSON.stringify(obj, null, 2));
}

test.only("t", async(t) => {

  try {
    // console.log('x')
    await director.compile();
    // console.log('y')
    writeJSON("tree.json", director.tree);
  } catch (e) {
    console.log(e)
  }


  // const proj = await ProjectFactory.getProject(testProjPath, mockLogger );
  // const bits = await ProjectFactory.getBits(testProjPath, "lede_modules", mockLogger );
  // console.log(bits)
  // const pages = await ProjectFactory.getPages(testPagePath, mockLogger);
  // const blocks = await ProjectFactory.getBlocks(testBlockPath, mockLogger);
  // console.log)
  // const mats = await ProjectFactory.getMaterials(testProjPath, "lede_modules", mockLogger);
  // const tree = await ProjectFactory.buildProjectModel(testProjPath, "lede_modules", mockLogger);
  // const scripts = await escomp.compile(tree);
  // const styles = await sasscomp.compile(tree);
  // const compiledPages = await njkcomp.compile({ tree, scripts, styles });
  // await deployer.deploy(compiledPages);
  // writeJSON("compiledPage.json", compiledPages);
  // writeJSON("compiledScripts.json", scripts);
  // writeJSON("compiledStyles.json", styles);
  // writeJSON("proj.json", proj);
  // writeJSON("bits.json", bits);
  // writeJSON("pages.json", pages);
  // writeJSON("blocks.json", blocks);
  // writeJSON("mats.json", mats);
  // writeJSON("tree.json", tree);
});