import { Dependency } from "../interfaces";
import { resolve } from 'path';
import { homedir } from 'os';


export class DefaultDependency implements Dependency {
  inheritanceRoot = process.env.LEDE_HOME ? resolve(homedir(), process.env.LEDE_HOME) : resolve(homedir(), "LedeProjects");
  name = 'defaultLedeProject';
  dependsOn = [];
  contentResolver = null;
  scripts = [];
  styles = [];
  blocks = ['ARTICLE'];
  assets = [];
  googleFileId = "";
}
