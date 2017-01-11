import { Logger } from "bunyan";
import { Environment, FileSystemLoader, Extension } from "nunjucks";
import slug from "slug";
import { join } from "path";

import { PageCompiler } from "../interfaces";
import { mockLogger } from "../utils";

export class ComponentExtension implements Extension {
  tags: string[];
  elementName: string;

  constructor({tags, elementName}) {
    this.tags = tags;
    this.elementName = elementName;
  }

  parse(parser, nodes, lexer) {
    const token = parser.nextToken();
    const args = parser.parseSignature(null, true);
    parser.advanceAfterBlockEnd(token.value);
    this.elementName = args.children[0].value;
    return new nodes.CallExtensionAsync(this, "run", args);
  }

  run(context, arg, cb) {
    const ctx = Object.assign({}, context.ctx, { [this.elementName]: arg });
    context.env.renderString(arg["$template"], ctx, cb);
  }
}

export class NunjucksCompiler implements PageCompiler {
  env: Environment;
  logger: Logger;

  constructor(arg?: {
    filters?: Array<{ name: string, fn: (txt: string) => string}>,
    extensions?: Array<{ name: string, ext: any }>,
    loaderOptions?: any,
    envOptions?: any,
    loaderPaths?: string[],
    logger?: Logger
  }) {
    this.logger = arg && arg.logger || mockLogger;
    const loaderOptions = Object.assign({watch: false, noCache: true}, arg && arg.loaderOptions ? arg.loaderOptions : {});
    const envOptions = Object.assign({autoescape: false, watch: false, noCache: true}, arg && arg.envOptions ? arg.envOptions : {});

    // Build extensions
    const bitExt = {tags: ["BIT", "bit"], elementName: "$bit"};
    const blockExt = {tags: ["BLOCK", "block"], elementName: "$block"};
    const baseExtensions = [
      {name: "Bit", ext: new ComponentExtension(bitExt)},
      {name: "Block", ext: new ComponentExtension(blockExt)}
    ];
    const extensions = arg && arg.extensions ? baseExtensions.concat(arg.extensions) : baseExtensions;

    // Build filters
    const baseFilters = [
      {
        name: "linebreaks",
        fn: function(txt) {
          return txt.split("\r\n").join("\n").split("\n")
            .filter(x => x.trim().length)
            .map(x => `<p>${x}</p>`)
            .join("\n");
        }
      },
      {
        name: "slugify",
        fn: function(txt, opts) {
          return slug(txt, opts);
        }
      }
    ];
    const filters = arg && arg.filters ? baseFilters.concat(arg.filters) : baseFilters;

    // Initialize loader
    const loader = new FileSystemLoader();
    loader.init(arg && arg.loaderPaths ? arg.loaderPaths : null, loaderOptions);

    // Initialize environment
    this.env = new Environment(loader, envOptions);
    filters.forEach(filter => this.env.addFilter(filter.name, filter.fn));
    extensions.forEach(ext => this.env.addExtension(ext.name, ext.ext));
  }

  async compile(tree, debug?) {
    debug = !debug ? false : true;
    const context = tree.context;
    const styles = tree.resources.styles;
    const scripts = tree.resources.scripts;
    const assets = tree.assets;

    const shell = context.$PROJECT.$template({styles, scripts, context});
    const rendered = await this.renderPage({shell, context});

    return {
      renderedPage: rendered,
      path: debug ? join(context.$PROJECT.$name, context.$PAGE.$dname) : join(context.$PROJECT.$deployRoot, context.$PAGE.$deployPath),
      files: [
        {name: "scripts.js", content: scripts},
      ].concat(assets)
    };
  }

  renderPage({shell, context}): Promise<string> {
    return new Promise((resolve, reject) => {
      this.env.renderString(shell, context, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }
}
