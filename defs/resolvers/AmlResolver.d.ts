import { Resolver, BitRef } from "../interfaces";
export declare class AmlResolver implements Resolver {
    googleId: string;
    gapikey: string;
    constructor(googleId: string, gapikey: string);
    /**
     * Fetches content from googledocs and parses it with archieml.
     */
    fetch(): Promise<BitRef[]>;
}
