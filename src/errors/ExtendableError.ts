

export class ExtendableError extends Error {
  fatal: boolean;

  constructor({message, fatal}) {
    super(message || "");
    this.name = this.constructor.name;
    this.message = message;
    this.fatal = fatal;
    Error.captureStackTrace(this, <any>this.constructor);
  }
}