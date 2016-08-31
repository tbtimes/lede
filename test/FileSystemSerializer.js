import { test } from "ava";
import { resolve } from "path";

import { FileSystemSerializer } from "../dist/FileSystemSerializer";
import { Project, Bit } from "../dist/models";

const testProjPath = resolve(__dirname, "fixtures", "test-project");
const testBitPath = resolve(__dirname, "fixtures", "test-project", "bits", "test-bit");

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
    },
    context: { baz: "qux" }
  };


  t.true(proj instanceof Project, "Should return an instance of Project.");
  t.deepEqual(proj, expected, "Should be correctly instantiated.")
});

test("Static getBit method should return an instantiated Bit.", async t => {
  const bit = await FileSystemSerializer.getBit(testBitPath);
  const expected = {
    version: 0,
    name: "testBit",
    context: { foo: "bar" },
    script: undefined,
    style: undefined,
    html: undefined
  };
  t.true(bit instanceof Bit, "Should return an instance of Bit.");
  t.deepEqual(bit, expected, "Should be correctly instantiated.")
});