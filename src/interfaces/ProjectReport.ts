import { Dependency } from './Dependency';

export interface ProjectReport {
  workingDirectory: string;
  dependencies: Dependency[];
  context: {
    content?: any,
    $debug?: boolean,
    $projName: string
  };
  styles: string[],
  scripts: string[],
  blocks: string[]
}