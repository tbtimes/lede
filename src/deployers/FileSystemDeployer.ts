const sander = require("sander");
import { join } from "path";

import { asyncMap } from "../utils";
import { Deployer } from "../interfaces/Deployer";
import { CompiledPage } from "../interfaces/Compiler";

export class FileSystemDeployer implements Deployer {
  deployDir: string;

  constructor({workingDir}) {
    this.deployDir = join(workingDir, ".ledeCache", "built");
  }

  async deploy(pages: CompiledPage[]): Promise<void> {
    await asyncMap(pages, async(p) => {
      await sander.writeFile(join(this.deployDir, p.path, "index.html"), p.renderedPage);
      await asyncMap(p.files, async(f) => {
        await sander.writeFile(join(this.deployDir, p.path, f.name), f.content);
      });
    });
  }
}