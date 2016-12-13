import { join } from "path";

import { ProjectFactory } from "../src/ProjectFactory";
import { ManyFiles } from "../src/errors/ProjectFactoryErrors";
import { mockLogger, flatten } from "../src/utils";

describe("ProjectFactory", () => {
  const pf = new ProjectFactory({workingDir: join(__dirname, "fixtures", "foo"), logger: mockLogger, depCacheDir: "lede_modules" });
  const manyFilesPF = new ProjectFactory({workingDir: join(__dirname, "fixtures", "failMany"), logger: mockLogger, depCacheDir: "lede_modules"});

  it("should constuct properly", () => {
    expect(pf.logger).toBe(mockLogger);
    expect(pf.workingDir).toBe(join(__dirname, "fixtures", "foo"));
    expect(pf.depCache).toBe(join(__dirname, "fixtures", "foo", "lede_modules"));
  });

  it("should fetch and instantiate a projectSettings file", async () => {
    const proj = await pf.getProject();
    expect(proj.deployRoot).toBe("test");
    expect(proj.name).toBe("foo");
    expect(proj.context["foo"]).toBe("bar");
  });

  it("should error if there are multiple projectSettings files in a project", (cb) => {
    manyFilesPF.getProject()
               .then(x => fail()) // Get bits should error, this should be unreachable
               .catch(e => {
                 expect(e).toBeInstanceOf(ManyFiles);
                 cb();
               });
  });

  it("should fetch and instantiate pages", async () => {
    const pages = await pf.getPages();
    expect(pages.length).toBe(2);
    expect(pages.filter(p => p.name === "baz").length).toBe(1);
    expect(pages.filter(p => p.name === "bar").length).toBe(1);
  });

  it("should fetch and instantiate blocks", async () => {
    const localBlocks = await (pf as any).getLocalBlocks();
    const depBlocks = [ ...flatten(await (pf as any).getDepBlocks())];
    const allBlocks = await pf.getBlocks();

    for (let b of allBlocks) {
      expect(b.source["called"]).toBe(1);
      expect(b.bits).toEqual([{ bit: "foo/foobar", context: {foo: "bar"}}]);
    }
    expect(depBlocks[0].namespace).toBe("test-dep");
    expect(depBlocks[0].name).toBe("tronc");
    expect(localBlocks[0].namespace).toBe("foo");
    expect(localBlocks[0].name).toBe("chorp");
  });

  it("should fetch and instantiate materials", async () => {
    const localMats = await (pf as any).getLocalMaterials();
    const depMats = await (pf as any).getDepMaterials();
    const allMats = await pf.getMaterials();

    // Local expectations
    expect(localMats.scripts.length).toBe(1);
    expect(localMats.styles.length).toBe(1);
    expect(localMats.assets.length).toBe(1);

    // Dep expectations
    expect(depMats.scripts.length).toBe(1);
    expect(depMats.styles.length).toBe(1);
    expect(depMats.assets.length).toBe(1);

    // All expectations
    expect(allMats.scripts.length).toBe(2);
    expect(allMats.styles.length).toBe(2);
    expect(allMats.assets.length).toBe(2);
  });

  it("should fetch and instantiate bits", async () => {
    const localBits = await (pf as any).getLocalBits();
    const depBits = flatten(await (pf as any).getDepBits());
    const allBits = await pf.getBits();

    // Local bits expectations
    expect(localBits.length).toBe(2);
    expect(localBits.find(b => b.name === "bazqux").context["foo"]).toBe("bar");
    expect(localBits[0].namespace).toBe("foo");

    // Dependency bits expectations
    expect(depBits.length).toBe(1);
    expect(depBits[0].namespace).toBe("test-dep");
    expect(depBits[0].name).toBe("fox");

    // All bits expectations
    expect(allBits).toEqual([...localBits, ...depBits]);


  });

  it("should error if there are multiple bitSettings files in a bit", (cb) => {
    manyFilesPF.getBits()
               .then(x => fail()) // Get bits should error, this should be unreachable
               .catch(e => {
                 expect(e).toBeInstanceOf(ManyFiles);
                 cb();
               });
  });
});
