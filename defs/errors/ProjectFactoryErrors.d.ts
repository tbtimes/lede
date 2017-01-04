/// <reference types="node" />
import { ExtendableError } from "./ExtendableError";
export declare class MissingFile extends ExtendableError {
    constructor({file, dir}: {
        file: any;
        dir: any;
    });
}
export declare class ManyFiles extends ExtendableError {
    constructor({file, dir}: {
        file: any;
        dir: any;
    });
}
export declare class LoadFile extends ExtendableError {
    detail: Error;
    constructor({file, dir, detail}: {
        file: any;
        dir: any;
        detail: any;
    });
}
