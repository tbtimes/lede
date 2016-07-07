import { join } from 'path';
import { readFileSync } from 'fs';
import { SassCompiler } from "../../dist/compilers/";


declare var asyncSpecWait: Function;
declare var asyncSpecDone: Function;

describe("SassCompiler", () => {
    let testFileOne = join(__dirname, "../stubs/test1.scss");
    let testFileTwo = join(__dirname, "../stubs/test2.scss");
    let testFileThree = join(__dirname, "../stubs/test3.scss");
    let outputPath = join(__dirname, '../stubs/outputs');

    let compiler = new SassCompiler();

    let testFileResultOne = readFileSync(join(outputPath, 'test1.css'));
    let testFileResultTwo = readFileSync(join(outputPath, 'test2.css'));
    let testFileResultThree = readFileSync(join(outputPath, 'test3.css'));


    it("should compileGlobals a sassfile", () => {
        compiler.compileSingle(testFileOne).then((output) => {
            expect(output.toString()).toEqual(testFileResultOne.toString());
            asyncSpecDone();
        });
        asyncSpecWait();
    });

    it("should compileGlobals multiple sassfiles", () => {
        compiler.run([testFileOne, testFileTwo, testFileThree]).then(([o1, o2, o3]) => {
            expect(o1.toString()).toEqual(testFileResultOne.toString());
            expect(o2.toString()).toEqual(testFileResultTwo.toString());
            expect(o3.toString()).toEqual(testFileResultThree.toString());
            asyncSpecDone();
        });
        asyncSpecWait();
    })
});