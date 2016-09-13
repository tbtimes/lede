import { test } from "ava";
import { join } from "path";
import { ProjectDirector } from "../dist/ProjectDirector";
import { ProjectFactory } from "../dist/ProjectFactory";
import { FileSystemDeployer } from "../dist/FileSystemDeployer";
import { inspect } from "util";

const testProjPath = join(__dirname, "fixtures", "test-project");

test.skip("Testing compiler", async t => {
  const pf = new ProjectFactory({workingDir: testProjPath});
  const deployer = new FileSystemDeployer({workingDir: testProjPath});
  const pd = new ProjectDirector({workingDir: testProjPath, projectFactory: pf, deployer});
  const report = await pd.buildReport();
  const page = await pd.compile(report);
  inspect(page, {depth: Infinity})
});