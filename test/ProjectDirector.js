import { test } from "ava";
import { join } from "path";
import { ProjectDirector } from "../dist/ProjectDirector";
import { ProjectFactory } from "../dist/ProjectFactory";

const testProjPath = join(__dirname, "fixtures", "test-project");

test.only("Testing compiler", async t => {
  const pf = new ProjectFactory({workingDir: testProjPath});
  const pd = new ProjectDirector({workingDir: testProjPath, projectFactory: pf})
  const report = await pd.buildReport();
  await pd.compile(report)
});