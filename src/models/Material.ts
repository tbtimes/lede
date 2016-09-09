const sander = require("sander");


export interface MaterialConstructorArgs {
  type: string;
  location?: string;
  content?: string;
  overridableName: string;
}

export class Material {
  location: string;
  type: string;
  content: string;
  overridableName: string;

  constructor({ location, type, content, overridableName }: MaterialConstructorArgs) {
    this.location = location;
    this.type = type;
    this.content = content || null;
    this.overridableName = overridableName;
  };

  /**
   * This loads the bit content and returns the bit
   * @returns {Material}
   */
  async fetch(): Promise<Material> {
    if (typeof this.content === "string") return this;
    if (!this.location) throw new Error(`Material has no location property`); // TODO: make custom error for this
    this.content = (await sander.readFile(this.location)).toString();
    return this;
  }

}