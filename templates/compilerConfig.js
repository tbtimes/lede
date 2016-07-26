let path = require('path');
let os = require('os');
let slug = require('slug');

let ledeHome = process.env.LEDE_HOME ? path.resolve(os.homedir(), process.env.LEDE_HOME) : path.resolve(os.homedir(), "LedeProjects");

module.exports = {
  compilers: {
    html: {
      path: path.resolve(ledeHome, "compilers", "NunjucksCompiler.js"),
      options: {
        watch: false,
        noCache: true,
        autoescape: false,
        filters: [
          {
            name: "linebreaks",
            fn: function(txt) {
              return txt
                .split("\r\n").join("\n").split("\n")
                .filter(x => x.trim().length)
                .map(x => `<p>${x}</p>`)
                .join("\n")
            }
          },
          {
            name: "slugify",
            fn: function(txt, opts) {
              return slug(txt, opts);
            }
          }
        ]
      }
    },
    css: {
      path: path.resolve(ledeHome, "compilers", "SassCompiler.js"),
      options: {
        includePaths: [],
        outputStyle: 'compact',
        sourceComments: false,
        sourceMapEmbed: false
      }
    },
    js: {
      path: path.resolve(ledeHome, "compilers", "Es6Compiler.js"),
      options: {}
    }
  }
};