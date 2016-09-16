import { ExtendableError } from "./ExtendableError";
import { join } from "path";

export class MissingFile extends ExtendableError {
  constructor({file, dir}) {
    super({message: `Could not find a ${file} file in ${dir}`, fatal: true});
  }
}

export class ManyFiles extends ExtendableError {
  constructor({file, dir}) {
    super({message: `Found multiple ${file} files in ${dir}`, fatal: true});
  }
}

export class LoadFile extends ExtendableError {
  detail: Error;

  constructor({file, dir, detail}) {
    super({message: `There was an error loading ${join(dir, file)}. It is likely a syntax error in that file.`, fatal: true});
    this.detail = detail;
  }
}