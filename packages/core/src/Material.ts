import { Cacheable } from "./Cache";

export class RenderedMaterial {
  constructor(
    public readonly id: string,
    public readonly content: string,
  ) {}
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