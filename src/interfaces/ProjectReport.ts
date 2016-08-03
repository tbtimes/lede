import { Dependency } from './Dependency';

export interface ProjectReport {
  workingDirectory: string;
  dependencies: Dependency[];
  context: {content?: any};
  styles: string[],
  scripts: string[],
  blocks: string[]
}