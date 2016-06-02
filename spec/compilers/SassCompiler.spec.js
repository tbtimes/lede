const SassCompiler = require('../../dist/compilers/SassCompiler');
const path = require('path');
const fs = require('fs');

describe("SassCompiler", () => {
  let testFileOne = path.join(__dirname, "../stubs/test1.scss");
  let testFileTwo = path.join(__dirname, "../stubs/test2.scss");
  let testFileThree = path.join(__dirname, "../stubs/test3.scss");
  let outputPath = path.join(__dirname, '../stubs/outputs');
  
  let compiler = new SassCompiler();
  
  let testFileResultOne = fs.readFileSync(path.join(outputPath, 'test1.css'));

  let testFileResultTwo = fs.readFileSync(path.join(outputPath, 'test2.css'));

  let testFileResultThree = fs.readFileSync(path.join(outputPath, 'test3.css'));
  
  
  it("should compile a sassfile", () => {
    compiler.compileSingle(testFileOne).then((output) => {
      expect(output.toString()).toEqual(testFileResultOne.toString());
      asyncSpecDone();
    });
    asyncSpecWait();
  });
  
  it("should compile multiple sassfiles", () => {
    compiler.run([testFileOne, testFileTwo, testFileThree]).then(([o1, o2, o3]) => {
      expect(o1.toString()).toEqual(testFileResultOne.toString());
      expect(o2.toString()).toEqual(testFileResultTwo.toString());
      expect(o3.toString()).toEqual(testFileResultThree.toString());
      asyncSpecDone();
    });
    asyncSpecWait();
  })
});