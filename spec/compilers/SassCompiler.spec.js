const SassCompiler = require('../../dist/compilers/SassCompiler');
const path = require('path');

describe("SassCompiler", () => {
  let testFileOne = path.join(__dirname, "../stubs/test1.scss");
  let testFileTwo = path.join(__dirname, "../stubs/test2.scss");
  let testFileThree = path.join(__dirname, "../stubs/test3.scss");
  
  let compiler = new SassCompiler();
  
  let testFileResultOne = `.test { color: white; }

.test h1 { background-color: red; }
`;

  let testFileResultTwo = `.test { color: orange; }

.test h1 { background-color: green; }
`;

  let testFileResultThree = `.test { color: black; }

.test h1 { background-color: blue; }
`;
  
  
  it("should compile a sassfile", () => {
    compiler.compileSingle(testFileOne).then((output) => {
      expect(output.toString()).toEqual(testFileResultOne);
      asyncSpecDone();
    });
    asyncSpecWait();
  });
  
  it("should compile multiple sassfiles", () => {
    compiler.run([testFileOne, testFileTwo, testFileThree]).then(([o1, o2, o3]) => {
      expect(o1.toString()).toEqual(testFileResultOne);
      expect(o2.toString()).toEqual(testFileResultTwo);
      expect(o3.toString()).toEqual(testFileResultThree);
      asyncSpecDone();
    })
    asyncSpecWait();
  })
});