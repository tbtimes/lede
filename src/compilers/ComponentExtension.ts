import { Extension } from "nunjucks";


export class ComponentExtensionFactory implements Extension {
  tags: string[];
  elementName: string;

  constructor({tags, elementName}) {
    this.tags = tags;
    this.elementName = elementName;
  };

  parse(parser, nodes, lexer) {
    const token = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);
    this.elementName = args.children[0].value;
    return new nodes.CallExtensionAsync(this, "run", args);
  }

  run(context, arg, cb) {
    let ctx = Object.assign({}, context.ctx, { [this.elementName]: arg});
    context.env.renderString(arg["$template"], ctx, cb);
  }
}
