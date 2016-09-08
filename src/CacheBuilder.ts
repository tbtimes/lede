import { join } from "path";

import { ProjectReport, Bit, Block } from "./models";
import { asyncMap } from "./utils";

// export interface ProjectReport {
//   workingDir: string;
//   project: Project;
//   blocks: Block[];
//   pages: Page[];
//   bits: Bit[];
// }

export class CacheBuilder {

  constructor() {};

  async serialize(report: ProjectReport) {
    // const cacheDir = join(report.workingDir, ".ledeCache");
    // await asyncMap(report.bits, (bit: Bit) => {
    //
    // });
    // await asyncMap(report.blocks, (block: Block) => {
    //   block.
    // })
  }
}