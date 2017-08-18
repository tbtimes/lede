import { LedeProject } from "./lib/LedeProject";
import { ProjectService } from "./services/ProjectService";
import { LedeBlock } from "./lib/LedeBlock";
import { LedeBit } from "./lib/LedeBit";
import { LogService } from "./services/LogService";
import { LedePage } from "./lib/LedePage";
import { WatcherService } from "./services/WatcherService";


class Lede {
  projectService: ProjectService;
  logService: LogService;
  watcherService: WatcherService;
  projects: Array<LedeProject> = [];

  constructor(logService: LogService, projectService: ProjectService, watcherService: WatcherService) {
    this.logService = logService;
    this.projectService = projectService;
    this.watcherService = watcherService;
  }

  public watchProject(prjName: string): void {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.error(`Could not find project: ${prjName}`);
      return;
    }
    return this.watcherService.watch(project);
  }

  public buildProject(prjName: string, outPath: string, dev: boolean): void {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.error(`Could not find project: ${prjName}`);
      return;
    }
    return project.build(outPath, dev);
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

  public createBlockInProject(prjName: string, blockName: string): void {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.error(`Could not find project: ${prjName}`);
      return;
    }
    return project.createBlock(blockName);
  }

  public createBitInProject(prjName: string, bitName: string): void {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.error(`Could not find project: ${prjName}`);
      return;
    }
    return project.createBit(bitName)
  }

  public createPageInProject(prjName: string, pageName: string): void {
    const project = this.findProjectByName(prjName);
    if (!project) {
      this.logService.error(`Could not find project: ${prjName}`);
      return;
    }
    return project.createPage(pageName);
  }

  private findProjectByName(prjName: string): LedeProject | null {
    const project = this.projects.find(({name}) => name === prjName);
    return project || null;
  }
}