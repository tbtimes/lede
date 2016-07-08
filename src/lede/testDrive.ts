import { Lede } from './Lede';
import { NunjucksCompiler, SassCompiler, Es6Compiler } from '../compilers';

let compilers = {
  html: new NunjucksCompiler(),
  css: new SassCompiler(),
  js: new Es6Compiler()
};

let l = new Lede(compilers);
l.buildProject("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/myProject")
 .then(console.log)
 .catch(console.log);