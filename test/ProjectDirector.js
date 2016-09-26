import { test } from "ava";
import { join } from "path";
import { ProjectDirector } from "../dist/ProjectDirector";
import { ProjectFactory } from "../dist/ProjectFactory";
import { FileSystemDeployer } from "../dist/deployers/FileSystemDeployer";
const sander = require("sander");
import { inspect } from "util";

const testProjPath = join(__dirname, "fixtures", "test-project");

test.only("Testing compiler", async t => {
  const pf = new ProjectFactory({workingDir: testProjPath});
  const deployer = new FileSystemDeployer({workingDir: join(testProjPath, ".ledeCache", "built")});
  const pd = new ProjectDirector({workingDir: testProjPath, projectFactory: pf, deployer});
  const report = await pd.buildReport();
  sander.writeFileSync("report.json", JSON.stringify(report, null, 2));
  const tree = await pd.buildPageTree(report);
  sander.writeFileSync("tree.json", JSON.stringify(tree, null, 2));
  await pd.compile(report);
  // inspect(page, {depth: Infinity})
});