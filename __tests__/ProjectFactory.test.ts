import { join } from "path";

import { ProjectFactory } from "../src/ProjectFactory";
import { ManyFiles } from "../src/errors/ProjectFactoryErrors";
import { mockLogger } from "../src/utils";

describe("ProjectFactory", () => {
  const pf = new ProjectFactory({workingDir: join(__dirname, "fixtures", "foo"), logger: mockLogger, depCacheDir: "x" });
  const manyFilesPF = new ProjectFactory({workingDir: join(__dirname, "fixtures", "failMany"), logger: mockLogger, depCacheDir: "x"});

  it("should constuct properly", () => {
    expect(pf.logger).toBe(mockLogger);
    expect(pf.workingDir).toBe(join(__dirname, "fixtures", "foo"));
    expect(pf.depCache).toBe(join(__dirname, "fixtures", "foo", "x"));
  });

  it("should fetch and instantiate a projectSettings file", async () => {
    const proj = await pf.getProject();
    expect(proj.deployRoot).toBe("test");
    expect(proj.name).toBe("foo");
    expect(proj.context["foo"]).toBe("bar");
  });

  it("should error if there are multiple projectSettings files in a project", async () => {
    try {
      await manyFilesPF.getProject();
    } catch (e) {
      expect(e).toBeInstanceOf(ManyFiles);
    }
  });
});
