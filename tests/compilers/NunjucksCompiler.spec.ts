import { NunjucksCompiler } from '../../dist/compilers';
import { join } from "path";
import { readFileSync } from "fs";

declare var asyncSpecWait: Function;
declare var asyncSpecDone: Function;

describe("NunjucksCompiler", () => {
    let TMPL_PATH = join(__dirname, '../stubs/templates');
    let TMPL_OUTPUT = join(__dirname, '../stubs/outputs/base.test.html');
    let compiler = new NunjucksCompiler(TMPL_PATH);
    let COMPILED = readFileSync(TMPL_OUTPUT);
    
    it("should compile a template", () => {
        compiler.renderTemplate('base.test.html').then((compiled) => {
            expect(compiled).toEqual(COMPILED.toString());
            asyncSpecDone()
        });
        asyncSpecWait()
    })
});