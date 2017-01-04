/// <reference types="node" />
export declare class ExtendableError extends Error {
    fatal: boolean;
    constructor({message, fatal}: {
        message: any;
        fatal: any;
    });
}
