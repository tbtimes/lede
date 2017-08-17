import { LedeProject } from "./lib/LedeProject";
import { ProjectService } from "./services/ProjectService";
import { LedeBlock } from "./lib/LedeBlock";
import { LedeBit } from "./lib/LedeBit";
import { LogService } from "./services/LogService";
import { LedePage } from "./lib/LedePage";


class Lede {
  projectService: ProjectService;
  logService: LogService;

  projects: Array<LedeProject> = [];



  constructor(logService: LogService, projectService: ProjectService) {
    this.logService = logService;
    this.projectService = projectService;
  }

  public createProject(prjName: string, path: string): LedeProject | null {
    try {
      const project = this.projectService.create(prjName, path);
      this.projects.push(project);
      return project;
    } catch (e) {
      this.logService.error(e);
      return null;
    }
  }
  public createBlockInProject(prjName: string, blockName: string): LedeBlock | null {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.warn(`Could not find project: ${prjName}`);
      return null;
    }
    return project.createBlock(blockName);
  }
  public createBitInProject(prjName: string, bitName: string): LedeBit | null {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.warn(`Could not find project: ${prjName}`);
      return null;
    }
    return project.createBit(bitName)
  }
  public createPageInProject(prjName: string, pageName: string): LedePage | null {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.warn(`Could not find project: ${prjName}`);
      return null;
    }
    return project.createPage(pageName);
  }

  private findProjectByName(prjName: string): LedeProject | null {
    const project = this.projects.find(({name}) => name === prjName);
    return project || null;
  }
}