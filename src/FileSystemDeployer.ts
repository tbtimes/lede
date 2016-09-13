const sander = require("sander");
import { join } from "path";

import { asyncMap } from "./utils";



export interface Deployer {
  deploy(pages: any[]): void;
}

export class FileSystemDeployer implements Deployer {
  deployDir: string;

  constructor({workingDir}) {
    this.deployDir = join(workingDir, ".ledeCache", "built");
  }

  async deploy(pages: any[]): void {
    await asyncMap(pages, async(p) => {
      await sander.writeFile(join(this.deployDir, p.path, "index.html"), p.renderedPage);
      await asyncMap(p.files, async(f) => {
        await sander.writeFile(join(this.deployDir, p.path, f.name), f.content);
      });
    });
  }
}