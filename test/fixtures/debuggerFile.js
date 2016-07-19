let path = require('path');
let DependencyAssembler =  require('../../dist/lede/DependencyAssembler').DependencyAssembler;

let pathToRootDep = path.resolve(__dirname, "../fixtures/projects/proj1");

DependencyAssembler.buildDependencies(pathToRootDep).then(console.log).catch(e => console.log(e));