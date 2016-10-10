import { ExtendableError } from "./ExtendableError";
import { join } from "path";

export class Es6Failed extends ExtendableError {
  detail: Error;

  constructor({detail}) {
    super({message: `An error occurred while compiling scripts`, fatal: true});
    this.detail = detail;
  }
}

export class SassFailed extends ExtendableError {
  detail: Error;

  constructor({detail}) {
    super({message: `An error occurred while compiling scripts`, fatal: true});
    this.detail = detail;
  }
}