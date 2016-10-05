import { BitRef, Resolver } from "./";


export interface BlockSettings {
  name: string;
  bits?: BitRef[];
  source?: Resolver;
  template?: string;
  context?: any;
}

export interface Block {
  name: string;
  template: string;
  context: any;
  bits: BitRef[];
}