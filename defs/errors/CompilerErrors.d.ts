/// <reference types="node" />
import { ExtendableError } from "./ExtendableError";
export declare class Es6Failed extends ExtendableError {
    detail: Error;
    constructor({detail}: {
        detail: any;
    });
}
export declare class SassFailed extends ExtendableError {
    detail: Error;
    constructor({detail}: {
        detail: any;
    });
}
