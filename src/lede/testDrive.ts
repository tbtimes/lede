import { Lede } from './Lede';
import { NunjucksCompiler, SassCompiler } from '../compilers';

let compilers = {
  html: new NunjucksCompiler(),
  css: new SassCompiler()
};

let l = new Lede(compilers);
l.buildProject("/Users/emurray/WebstormProjects/lede/spec/stubs/projects/sample-project")
 .then(console.log)
 .catch(console.log);