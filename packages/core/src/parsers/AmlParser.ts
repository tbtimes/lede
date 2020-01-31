import { load, AmlOpts } from "archieml";
import { Parser, ParserParams } from "./Parser";


export class AmlParser implements Parser {

  constructor(private opts: AmlOpts) {}

  async apply({logger, source}: ParserParams) {
    return load(source.toString("utf8"), this.opts)
  }
}
