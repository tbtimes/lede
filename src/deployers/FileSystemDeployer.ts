const sander = require("sander");
import { Logger } from "bunyan";
import { join } from "path";

import { Deployer, CompiledPage } from "../interfaces";
import { mockLogger } from "../utils";


export class FileSystemDeployer implements Deployer {
  deployDir: string;
  logger: Logger;

  constructor({workingDir, logger}: {workingDir: string, logger?: Logger}) {
    this.deployDir = workingDir;
    this.logger = logger || mockLogger;
  }

  async deploy(page: CompiledPage): Promise<any> {
    const files = page.files.map(f => {
      if (f.content) {
        return sander.writeFile(join(this.deployDir, page.path, f.name), f.content);
      }
      return sander.copyFile(f.path).to(join(this.deployDir, page.path, f.overridableName || f.name));
    });

    return Promise.all([
      sander.writeFile(join(this.deployDir, page.path, "index.html"), page.renderedPage),
      ...files
    ]);
  }
}