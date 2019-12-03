// @ts-ignore
import * as murmur from "murmurhash3js-revisited";

export const SYM_CACHE_KEY = Symbol("cacheKey");

export class RenderedMaterial {
  constructor(
    public readonly id: string,
    public readonly content: string,
  ) {}
}

export interface Compiler {
  compile(buf: Buffer, context?: any): Buffer;
}

export interface Cacheable {
  [SYM_CACHE_KEY]?: CacheKey;
  getContentBuffer(): Buffer;
}

export class CacheKey {
  constructor(public readonly hash: string) {}
}

export class Cache<T> {
  private cache: WeakMap<CacheKey, T>;

  constructor() {}

  store(item: Cacheable, value: T): void {
    const key = this.getKey(item);
    this.cache.set(key, value);
  }

  get(item: Cacheable): T {
    const key = this.getKey(item);
    return this.cache.get(key);
  }

  has(item: Cacheable): boolean {
    const key = this.getKey(item);
    return this.cache.has(key);
  }

  private getKey(item: Cacheable): CacheKey {
    if (!item[SYM_CACHE_KEY]) {
      item[SYM_CACHE_KEY] = new CacheKey(murmur.x64.hash128(item.getContentBuffer()));
    }
    return item[SYM_CACHE_KEY];
  }
}

export class CacheMaterial implements Cacheable {

  constructor(
    public readonly id: string,
    public readonly content: Buffer,
  ) {}

  getContentBuffer(): Buffer {
    return this.content;
  }
}

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

export class RenderedBit {
  constructor(
    public readonly template: String,
    public readonly script: String,
    public readonly styles: String
  ) {}
}

export class RenderedPage {
  constructor(
    private readonly template: String,
    private readonly script: String,
    private readonly styles: String
  ) {}
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

export class BitContext {
  templateEntry: RegExp;
  scriptEntry: RegExp;
  styleEntry: RegExp;
}

export class Bit implements Cacheable {
  constructor(
    private mats: CacheMaterial[],
    private ctx: BitContext,
    private styleCompiler: Compiler,
    private scriptCompiler: Compiler,
    private templateCompiler: Compiler,
  ) {}

  async render(matCache: Cache<RenderedMaterial>): Promise<RenderedBit> {
    const r: RenderedMaterial[] = [];
    for (let mat of this.mats) {
      let rm: RenderedMaterial;
      if (matCache.has(mat)) {
        rm = matCache.get(mat);
      } else {
        switch (true) {
          case /.*\.scss$/.test(mat.id): {
            // Compile as style
            const c = this.styleCompiler.compile(mat.content, this.ctx);
            rm = new RenderedMaterial(mat.id, c.toString());
            break;
          }
          case /.*\.(ts|js)$/.test(mat.id): {
            // Compile as script
            const c = this.scriptCompiler.compile(mat.content, this.ctx);
            rm = new RenderedMaterial(mat.id, c.toString());
            break;
          }
          case /.*\.html$/.test(mat.id): {
            // Compile as template
            const c = this.templateCompiler.compile(mat.content, this.ctx);
            rm = new RenderedMaterial(mat.id, c.toString());
            break;
          }
          default: {
            rm = new RenderedMaterial(mat.id, mat.getContentBuffer().toString());
          }
        }
        matCache.store(mat, rm);
      }
      r.push(rm);
    }
  }

  getContentBuffer(): Buffer {
    return Buffer.concat([
      Buffer.from(JSON.stringify(this.ctx)),
      ...this.mats.map(x => x.getContentBuffer()),
    ])
  }
}

export class Page {
  constructor(
    private blocks: Block[]
  ) {}

  async render(): Promise<RenderedPage> {
    const r: RenderedBlock[] = [];
    for (let block of this.blocks) {
      r.push(await block.render());
    }
    return new RenderedPage(
      r.map(x => x.template).join(),
      r.map(x => x.scripts).join(),
      r.map(x => x.styles).join()
    );
  }
}

export class ScriptCompiler {
  constructor(private debug: boolean = true) {}


}