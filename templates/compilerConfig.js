let path = require('path');
let os = require('os');

let ledeHome = process.env.LEDE_HOME ? path.resolve(os.homedir(), process.env.LEDE_HOME) : path.resolve(os.homedir(), "LedeProjects");

module.exports = {
  compilers: {
    html: {
      path: path.resolve(ledeHome, "compilers", "NunjucksCompiler.js"),
      options: {}
    },
    css: {
      path: path.resolve(ledeHome, "compilers", "SassCompiler.js"),
      options: {}
    },
    js: {
      path: path.resolve(ledeHome, "compilers", "Es6Compiler.js"),
      options: {}
    }
  }
};