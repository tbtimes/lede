import { BitRef } from "./";

export interface Resolver {
  fetch: () => Promise<BitRef[]>;
}