export class CircularDepError extends Error {
    code: string;
    message: string;
    stack: any;

    constructor(depName: string) {
        super();
        this.code = "CircularDepError";
        this.message = `${depName}`;
        this.stack = (new Error()).stack;
    }
}