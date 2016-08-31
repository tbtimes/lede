import { load } from "archieml";

import { httpsGetProm } from "./utils";
import { Resolver, GoogleRestAPI } from "./interfaces";


export class AmlResolver implements Resolver {
  constructor(public googleId: string, public gapikey: string) {};

  /**
   * Fetches content from googledocs and parses it with archieml. NOTE: This incorrectly implements the resolver interface
   * right now because it returns any but it should return an array of instantiated bits.
   */
  async fetch() {
    const descriptorOpts = {
      hostname: "www.googleapis.com",
      path: `/drive/v2/files/${this.googleId}?key=${this.gapikey}`
    };
    const descriptor: string = await httpsGetProm(descriptorOpts);
    const parsedDescriptor: GoogleRestAPI = JSON.parse(descriptor);
    const plainUrl = parsedDescriptor.exportLinks["text/plain"].slice(8);
    const fileOpts = {
      hostname: plainUrl.split("/")[0],
      path: `/${plainUrl.split("/").slice(1).join("/")}`
    };
    const file = await httpsGetProm(fileOpts);
    // TODO: return instantiated bits;
    return load(file);
  };
}
