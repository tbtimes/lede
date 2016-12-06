import { BitRef, Resolver } from "./";


export interface BlockSettings {
  name: string;
  namespace: string;
  bits?: BitRef[];
  source?: Resolver;
  template?: string;
  context?: any;
}
