import { DriveResolver } from "../../../src/resolvers";
import { AmlParser } from "../../../src/parsers";

export default {
  source: new DriveResolver(),
  parser: new AmlParser(),
}