// const NunjucksCompiler = require('../../dist/compilers/NunjucksCompiler');
// const path = require('path');
// const fs = require('fs');
//
// describe("NunjucksCompiler", () => {
//   let TMPL_PATH = path.join(__dirname, '../stubs/templates');
//   let TMPL_OUTPUT = path.join(__dirname, "../stubs/outputs/base.test.html");
//   let compiler = new NunjucksCompiler(TMPL_PATH);
//   let COMPILED = fs.readFileSync(TMPL_OUTPUT);
//
//
//   it("should compile a template", () => {
//     compiler.renderTemplate('base.test.html').then((compiled) => {
//       expect(compiled.toString()).toEqual(COMPILED.toString());
//       asyncSpecDone();
//     });
//     asyncSpecWait();
//   });
// });