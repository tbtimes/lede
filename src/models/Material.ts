const sander = require("sander");


export interface MaterialConstructorArgs {
  type: string;
  location?: string;
  content?: string;
}

export class Material {
  location: string;
  type: string;
  content: string;

  constructor({ location, type }: MaterialConstructorArgs) {
    this.location = location;
    this.type = type;
    this.content = "";
  };

  /**
   * This loads the bit content and returns the bit
   * @returns {Material}
   */
  async fetch(): Promise<Material> {
    if (this.content) return this;
    if (!this.location) throw new Error("Material has no location property"); // TODO: make custom error for this
    this.content = await sander.readFile(this.location);
    return this;
  }

}