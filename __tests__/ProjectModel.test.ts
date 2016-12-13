import { join } from "path";

import { ProjectModel } from "../src/ProjectModel";


describe("ProjectModel", () => {
  const pm = new ProjectModel(join(__dirname, "fixtures", "foo"));
  it("should succeed", () => {
    expect(true).toBe(true);
  });
});