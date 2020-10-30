import { load } from "archieml";

import { httpsGetProm } from "../utils";
import { Resolver, BitRef } from "../interfaces";
import { GoogleRestAPI } from "../interfaces/GoogleRestAPI";


export class AmlResolver implements Resolver {
  constructor(public googleId: string, public gapikey: string) {};

  /**
   * Fetches content from googledocs and parses it with archieml.
   */
  async fetch(): Promise<BitRef[]> {
    const descriptorOpts = {
      hostname: "www.googleapis.com",
      path: `/drive/v2/files/${this.googleId}?key=${this.gapikey}`
    };
    const descriptor: string = await httpsGetProm(descriptorOpts);
    const parsedDescriptor: GoogleRestAPI = JSON.parse(descriptor);
    if (parsedDescriptor.error) {
      throw parsedDescriptor.error;
    }
    const plainUrl = parsedDescriptor.exportLinks["text/plain"].slice(8);
    const fileOpts = {
      hostname: plainUrl.split("/")[0],
      path: `/${plainUrl.split("/").slice(1).join("/")}`
    };
    let file = await httpsGetProm(fileOpts);
    if (file.includes('<TITLE>Temporary Redirect</TITLE>')) {
        const redirectBefore = 'The document has moved <A HREF="https://';
        const redirectAfter = '">here</A>'
        const redirectUrl = file.split(redirectBefore)[1].split(redirectAfter)[0].replace('&amp;', '&');
        const redirectFileOpts = {
            hostname: redirectUrl.split("/")[0],
            path: `/${redirectUrl.split("/").slice(1).join("/")}`
        }
        file = await httpsGetProm(redirectFileOpts);
    }
    const loadedFile = load(file);
    if (!loadedFile.CONTENT) {
      throw new Error(`Cannot find CONTENT array in AML document. AML files should look like this:
[CONTENT]
// bits go here
[]
`);
    }
    const bitRefs = load(file).CONTENT;

    return bitRefs.map(b => {
      return Object.keys(b).reduce((state, key) => {
        if (key !== "bit") {
          state.context[key] = b[key];
        }
        return state;
      }, { bit: b.bit, context: {} });
    });
  };
}
