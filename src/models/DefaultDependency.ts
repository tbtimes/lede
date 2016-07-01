import { Dependency } from '../interfaces';


export class DefaultDependency implements Dependency {
    inheritanceRoot = '';
    name = 'default lede project';
    dependsOn = [];
    contentResolver = null;
}