import { ContentResolver } from './ContentResolver';

export interface Dependency {
  inheritanceRoot: string;
  workingDir?: string;
  name: string;
  dependsOn: string[];
  contentResolver?: ContentResolver;
  dependedOnBy?: string[];
  scripts: string[];
  styles: string[];
  blocks: string[];
}