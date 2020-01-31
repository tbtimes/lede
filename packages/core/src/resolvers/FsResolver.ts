import { Resolver, ResolverParams } from "./Resolver";
import { readFile } from "fs";
import { promisify } from "util";
const rf = promisify(readFile);


export class FsResolver implements Resolver {

  constructor(private file: string) {}

  async fetch({}: ResolverParams) {
    return await rf(this.file);
  }
}