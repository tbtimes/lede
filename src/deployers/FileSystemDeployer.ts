const sander = require("sander");
import { Logger } from "bunyan";
import { join } from "path";

import { Deployer, CompiledPage } from "../interfaces";
import { mockLogger } from "../utils";


export class FileSystemDeployer implements Deployer {
  deployDir: string;
  logger: Logger;

  constructor({workingDir}) {
    this.deployDir = workingDir;
    this.logger = <Logger><any>mockLogger;
  }

  configure({logger}) {
    this.logger = logger;
  }

  async deploy(pages: CompiledPage[]): Promise<any> {
    this.logger.info(`Deploying ${pages.length} pages to ${ this.deployDir }`);
    this.logger.debug({pages: pages});
    return Promise.all(pages.map(p => {
      const files = p.files.map(f => {
        if (f.content) {
          return sander.writeFile(join(this.deployDir, p.path, f.name), f.content);
        }
        return sander.copyFile(f.path).to(join(this.deployDir, p.path, f.overridableName || f.name ));
      });
      return Promise.all([
        sander.writeFile(join(this.deployDir, p.path, "index.html"), p.renderedPage),
        ...files
      ]);
    }));
  }
}