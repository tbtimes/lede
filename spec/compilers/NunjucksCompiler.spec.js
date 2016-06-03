"use strict";
const NunjucksCompiler_1 = require('../../dist/compilers/NunjucksCompiler');
const path_1 = require("path");
const fs_1 = require("fs");
describe("NunjucksCompiler", () => {
    let TMPL_PATH = path_1.join(__dirname, '../stubs/templates');
    let TMPL_OUTPUT = path_1.join(__dirname, '../stubs/outputs/base.test.html');
    let compiler = new NunjucksCompiler_1.default(TMPL_PATH);
    let COMPILED = fs_1.readFileSync(TMPL_OUTPUT);
    it("should compile a template", () => {
        compiler.renderTemplate('base.test.html').then((compiled) => {
            expect(compiled).toEqual(COMPILED.toString());
            asyncSpecDone();
        });
        asyncSpecWait();
    });
});
