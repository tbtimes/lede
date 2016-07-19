import { Lede } from './Lede';
import { NunjucksCompiler, SassCompiler, Es6Compiler } from '../compilers';
import { FileSystemDeployer } from "../deployers/FileSystemDeployer";

let compilers = {
  html: new NunjucksCompiler(),
  css: new SassCompiler(),
  js: new Es6Compiler()
};

let deployer = new FileSystemDeployer("C:\Users\emurray\Desktop\GitHub\ledeTwo\spec\stubs\projects\myProject")

let l = new Lede(compilers);
l.deployProject("C:\Users\emurray\Desktop\GitHub\ledeTwo\spec\stubs\projects\myProject", deployer)
 .then(console.log)
 .catch(console.log);