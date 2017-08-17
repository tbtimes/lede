import { LedeBit } from "./LedeBit";
import { LedeBlock } from "./LedeBlock";
import { LedePage } from "./LedePage";


export class LedeProject {
  name: string;
  rootPath: string;
  context: any;
  bits: Array<LedeBit>;
  blocks: Array<LedeBlock>;
  pages: Array<LedePage>;

  constructor(name: string, rootPath: string) {
    this.name = name;
    this.rootPath = rootPath;
    this.context = {};
  }

  public createBlock(blockName: string): LedeBlock {}
  public createBit(bitName: string): LedeBit {}
  public createPage(pageName: string): LedePage {}
}