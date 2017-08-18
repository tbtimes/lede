import { LedeBit } from "./LedeBit";
import { LedeBlock } from "./LedeBlock";
import { LedePage } from "./LedePage";
import { BitService } from "../services/BitService";
import { BlockService } from "../services/BlockService";
import { PageService } from "../services/PageService";
import { join } from "path";


export class LedeProject {
  name: string;
  rootPath: string;
  bitRoot: string;
  blockRoot: string;
  pageRoot: string;
  context: any;
  bitService: BitService;
  blockService: BlockService;
  pageService: PageService;
  bits: Array<LedeBit>;
  blocks: Array<LedeBlock>;
  pages: Array<LedePage>;

  constructor(name: string, rootPath: string, blockService: BlockService, bitService: BitService, pageService: PageService) {
    this.name = name;
    this.rootPath = rootPath;
    this.context = {};
    this.blockService = blockService;
    this.pageService = pageService;
    this.bitService = bitService;
    this.bitRoot = join(rootPath, "bits");
    this.blockRoot = join(rootPath, "blocks");
    this.pageRoot = join(rootPath, "pages");
  }

  public createBlock(blockName: string): void {
    if (this.findBlockByName(blockName)) {
      throw new Error(`Block ${blockName} already exists`);
    }
    const block = this.blockService.create(blockName, this.blockRoot);
    this.blocks.push(block);
  }

  public createBit(bitName: string): void {
    if (this.findBitByName(bitName)) {
      throw new Error(`Bit ${bitName} already exists`);
    }
    const bit = this.bitService.create(bitName, this.bitRoot);
    this.bits.push(bit);
  }

  public createPage(pageName: string): void {
    if (this.findPageByName(pageName)) {
      throw new Error(`Page ${pageName} already exists`);
    }
    const page = this.pageService.create(pageName, this.pageRoot);
    this.pages.push(page);
  }

  public build(outPath: string, dev: boolean): void {
    // TODO build context and compile scripts, styles, bits and nunjucks
  }

  private findBlockByName(blockName: string): LedeBlock | null {
    const block = this.blocks.find((block) => block.name === blockName);
    return block || null;
  }

  private findBitByName(bitName: string): LedeBit | null {
    const bit = this.bits.find((bit) => bit.name === bitName);
    return bit || null;
  }

  private findPageByName(pageName: string): LedePage | null {
    const page = this.pages.find((page) => page.name === pageName);
    return page || null;
  }
}