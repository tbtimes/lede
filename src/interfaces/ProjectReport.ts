import { Dependency } from './Dependency';

export interface ProjectReport {
  workingDirectory: string;
  dependencies: Dependency[];
  context: any;
  styles: string[],
  scripts: string[],
  blocks: string[],
  bitLoop: string
}