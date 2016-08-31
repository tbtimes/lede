import { test } from "ava";
import { resolve } from "path";

import { FileSystemSerializer } from "../dist/FileSystemSerializer";
import { Project } from "../dist/models";

const testProjPath = resolve(__dirname, "fixtures", "test-project");

test("Static getProject method should return an instantiated Project.", async t => {
  const proj = await FileSystemSerializer.getProject(testProjPath);
  const expected = {
    name: "tester",
    deployRoot: "some/root/directory",
    defaults: { materials: [], metaTags: [], blocks: [] },
    compilers: {
      html: { compilerClass: {}, constructorArg: {} },
      style: { compilerClass: {}, constructorArg: {} },
      script: { compilerClass: {}, constructorArg: {} },
    }
  };


  t.true(proj instanceof Project, "Should return an instance of Project.");
  t.deepEqual(proj, expected, "Should be correctly instantiated.")
});