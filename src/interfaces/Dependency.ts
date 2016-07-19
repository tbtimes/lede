
export interface Dependency {
  inheritanceRoot: string;
  workingDir?: string;
  name: string;
  dependsOn: string[];
  dependedOnBy?: string[];
  scripts: string[];
  styles: string[];
  blocks: string[];
  googleFileId: string;
}