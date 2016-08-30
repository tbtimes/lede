import { test } from "ava";
import { resolve } from "path";

import { FileSystemSerializer } from "../dist/FileSystemSerializer";

const testProjPath = resolve(__dirname, "fixtures", "test-project");

test("FileSystemSerializer", async t => {
  FileSystemSerializer.getProject(testProjPath);
  t.pass();
});