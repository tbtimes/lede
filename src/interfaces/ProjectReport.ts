import { Dependency } from './Dependency';

export interface ProjectReport {
  workingDirectory: string;
  content: any;
  dependencies: Dependency[];
  context: any;
  styles: string[],
  scripts: string[],
  blocks: string[]
}