
export interface ParserParams {
  logger: any; // TODO: link to actual logger interface
  source: Buffer;
}

export interface Parser {
  apply(params: ParserParams): Promise<any>; // TODO: make concrete return
}
