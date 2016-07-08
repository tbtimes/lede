import { Dependency } from "../interfaces";


export class DefaultDependency implements Dependency {
  inheritanceRoot = '';
  name = 'defaultLedeProject';
  dependsOn = [];
  contentResolver = null;
  scripts = [];
  styles = [];
  blocks = [];
}