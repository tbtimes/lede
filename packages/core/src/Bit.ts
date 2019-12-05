import { Cache, Cacheable } from "./Cache";
import { CacheMaterial, RenderedMaterial } from "./Material";
import { Compiler } from "./Compiler";

export class RenderedBit {
  constructor(
    public readonly template: String,
    public readonly script: String,
    public readonly styles: String
  ) {}
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

  async render(matCache: Cache<RenderedMaterial>): /*Promise<RenderedBit>*/ Promise<any> {
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
    ]);
  }
}