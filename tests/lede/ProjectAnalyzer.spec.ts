import { join } from 'path';
import DefaultProjectSettings from '../../dist/models/DefaultProjectSettings';
import ProjectAnalyzer from "../../dist/lede/ProjectAnalyzer";


declare var asyncSpecWait: Function;
declare var asyncSpecDone: Function;

describe("ProjectAnalyzer", () => {
    let workingDir1 = join(__dirname, '../stubs/test-proj');
    let analyzer1 = new ProjectAnalyzer(workingDir1);
    let expectedSettings = require(`${workingDir1}/projectSettings`).default;
    expectedSettings = Object.assign(new DefaultProjectSettings(), new expectedSettings());
    
    let workingDir2 = join(__dirname, '../stubs/test-proj2');
    let analyzer2 = new ProjectAnalyzer(workingDir2);
    
    it("should gather project settings", () => {
       asyncSpecWait();
         
       analyzer1.gatherProjSettings().then((projSettings) => {
           expect(JSON.stringify(projSettings)).toEqual(JSON.stringify(expectedSettings));
           asyncSpecDone();
       })
    });
    
    it("should load default settings when no projectSettings.js exists", () => {
        asyncSpecWait();
     
        analyzer2.gatherProjSettings().then((projSettings) => {
            let defaults = new DefaultProjectSettings();
            expect(JSON.stringify(projSettings)).toEqual(JSON.stringify(defaults));
            asyncSpecDone();
        })
    });
});