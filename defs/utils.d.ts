/// <reference types="node" />
import { Logger } from "bunyan";
import { RequestOptions } from "https";
export declare const mockLogger: Logger;
export declare function httpsGetProm(options: RequestOptions): Promise<string>;
export declare function flatten(a: Array<any>): any[];
