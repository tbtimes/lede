

export class RenderedMaterial {

}

export class CachedMaterial implements Material {
    async compile(): Promise<RenderedMaterial> {

    }
}

export interface Material {
    compile(): Promise<RenderedMaterial>
}

export interface BlockResolver {
    fetch(): Promise<Bit[]>;
}


export class RenderedBlock {
    private readonly bits: RenderedBit[];

    get template(): String {
        return this.bits.map(x => x.template).join();
    }
    get styles(): String {
        return this.bits.map(x => x.styles).join();
    }
    get scripts(): String {
        return this.bits.map(x => x.script).join();
    }

    constructor(private bits: RenderedBit[] = []) {}
}

export class RenderedBit {
    public readonly template: String;
    public readonly script: String;
    public readonly styles: String;
    constructor(private template: String, private script: String, private styles: String) {}
}

export class RenderedPage {
    public readonly template: String;
    public readonly script: String;
    public readonly styles: String;
    constructor(private template: String, private script: String, private styles: String) {}
}

export class Block {
    private resolver: BlockResolver;

    async render(): Promise<RenderedBlock> {
        const uBits = await this.resolver.fetch();
        const r: RenderedBit[] = [];
        for (let bit of uBits) {
            r.push(await bit.render());
        }
        return new RenderedBlock(r);
    }
}

export class Bit {
    private mats: Material[];

    async render(): Promise<RenderedBit>  {
        for (let mat of this.mats) {

        }
    }
}

export class Page {
    private blocks: Block[];

    constructor() {

    }

    async render(): Promise<RenderedPage> {
        const r: RenderedBlock[] = [];
        for (let block of this.blocks) {
            r.push(await block.render())
        }
        return new RenderedPage(
            r.map(x => x.template).join(),
            r.map(x => x.scripts).join(),
            r.map(x => x.styles).join()
        )
    }
}