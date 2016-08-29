/* tslint:disable */
export class NotAFile extends Error {
  code: string;
  message: string;
  stack: any;

  constructor(filename: string) {
    super();
    this.code = "NotAFile";
    this.message = `${filename}`;
    this.stack = (new Error()).stack;
  }
}