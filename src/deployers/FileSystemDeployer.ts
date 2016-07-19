import { join } from "path";

import { createDir, writeProm, copyProm } from "../utils";
import { CompiledPage, ProjectReport } from "../interfaces";


export class FileSystemDeployer {
  constructor(public deployDir: string) {};

  async deploy(project: {report: ProjectReport, compiledPage: CompiledPage}) {
    await createDir(this.deployDir);
    await writeProm(project.compiledPage.index, join(this.deployDir, 'index.html'));
    await writeProm(project.compiledPage.scripts.data, join(this.deployDir, project.compiledPage.scripts.file));
    await writeProm(project.compiledPage.styles.data, join(this.deployDir, project.compiledPage.styles.file));
    await copyProm(join(project.report.workingDirectory, '.ledeCache', 'assets'), join(this.deployDir, 'assets'))
  }
}
