export class CircularDepError extends Error {
    name: string;
    message: string;
    stack: any;

    constructor(msg) {
        super();
        this.name = "Circular Dependency Error";
        this.message = msg;
        this.stack = (new Error()).stack;
    }
}