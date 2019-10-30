// @ts-ignore
import { Block, RenderedBlock } from "./Block";


export class RenderedPage {
  constructor(
    private readonly template: String,
    private readonly script: String,
    private readonly styles: String
  ) {}
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