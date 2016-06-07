export class NamespaceError extends Error {
    name: string;
    message: string;
    stack: any;

    constructor(msg) {
        super();
        this.name = "Namespace Error";
        this.message = msg;
        this.stack = (new Error()).stack;
    }
}