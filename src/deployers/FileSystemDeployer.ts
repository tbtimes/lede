const sander = require("sander");
import { Logger } from "bunyan";
import { join } from "path";

import { asyncMap } from "../utils";
import { Deployer } from "../interfaces/Deployer";
import { CompiledPage } from "../interfaces/Compiler";
import { mockLogger } from "../DefaultLogger";


export class FileSystemDeployer implements Deployer {
  deployDir: string;
  logger: Logger;

  constructor({workingDir}) {
    this.deployDir = join(workingDir, ".ledeCache", "built");
    this.logger = <any>mockLogger();
  }

  configure({logger}) {
    this.logger = logger;
  }

  async deploy(pages: CompiledPage[]): Promise<void> {
    this.logger.info(`Deploying ${pages.length} pages to ${ this.deployDir }`);
    this.logger.debug({pages: pages});
    await asyncMap(pages, async(p) => {
      await sander.writeFile(join(this.deployDir, p.path, "index.html"), p.renderedPage);
      await asyncMap(p.files, async(f) => {
        await sander.writeFile(join(this.deployDir, p.path, f.name), f.content);
      });
    });
  }
}