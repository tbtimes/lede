import { createDir, writeProm } from '../utils';
import { CompiledPage, ProjectReport } from "../interfaces";


export class FileSystemDeployer {
  constructor(public deployDir: string){};
  
  async deploy(project: {report: ProjectReport, compiledPage: CompiledPage}) {
    await createDir(this.deployDir);
    await writeProm(project.compiledPage.index, `${this.deployDir}/index.html`);
    await writeProm(project.compiledPage.scripts.data, `${this.deployDir}/${project.compiledPage.scripts.file}`);
    await writeProm(project.compiledPage.styles.data, `${this.deployDir}/${project.compiledPage.styles.file}`);
  }
}