import { Resolver, ResolverParams } from "./Resolver";


export class DriveResolver implements Resolver {

  async fetch({}: ResolverParams) {
    return Buffer.from("");
  }
}
