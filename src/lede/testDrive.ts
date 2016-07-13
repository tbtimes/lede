import { Lede } from './Lede';
import { NunjucksCompiler, SassCompiler, Es6Compiler } from '../compilers';
import { FileSystemDeployer } from "../deployers/FileSystemDeployer";

let compilers = {
  html: new NunjucksCompiler(),
  css: new SassCompiler(),
  js: new Es6Compiler()
};

let deployer = new FileSystemDeployer("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/myProject/build")

let l = new Lede(compilers);
l.deployProject("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/myProject", deployer)
 .then(console.log)
 .catch(console.log);