import { Bit, RenderedBit } from "./Bit";
import { Cache } from "./Cache";
import { RenderedMaterial } from "./Material";

export interface BlockResolver {
  fetch(): Promise<Bit[]>;
}

export class RenderedBlock {
  constructor(
    private bits: RenderedBit[]
  ) {}

  get template(): String {
    return this.bits.map(x => x.template).join();
  }

  get styles(): String {
    return this.bits.map(x => x.styles).join();
  }

  get scripts(): String {
    return this.bits.map(x => x.script).join();
  }
}

export class Block {
  private matCache: Cache<RenderedMaterial>;
  private bitCache: Cache<RenderedBit>;

  constructor(
    private resolver: BlockResolver
  ) {
    this.matCache = new Cache();
    this.bitCache = new Cache();
  }

  async render(): Promise<RenderedBlock> {
    const uBits = await this.resolver.fetch();
    const r: RenderedBit[] = [];
    for (let bit of uBits) {
      let rb: RenderedBit;
      if (this.bitCache.has(bit)) {
        rb = this.bitCache.get(bit);
      } else {
        rb = await bit.render(this.matCache);
        this.bitCache.store(bit, rb);
      }
      r.push(rb);
    }
    return new RenderedBlock(r);
  }
}