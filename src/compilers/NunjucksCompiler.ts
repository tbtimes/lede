import { Environment, FileSystemLoader } from "nunjucks";
import { createReadStream } from "fs-extra";
import ComponentExtension from "./ComponentExtension";
import * as slug from "slug";


export class NunjucksCompiler {
  env: Environment;

  constructor(opts: {
    filters?: any[],
    extensions?: any[],
    loaderOptions?: any,
    envOptions?: any,
    loaderPaths: string[]
  }) {
    const loaderOptions = Object.assign({watch: false, noCache: true}, opts.loaderOptions || {});
    const envOptions = Object.assign({autoescape: false, watch: false, noCache: true}, opts.envOptions || {});

    // Build extensions
    const bitExt = {tags: ["BIT", "bit"], elementName: "$bit"};
    const blockExt = {tags: ["BLOCK", "block"], elementName: "$block"};
    const baseExtensions = [
      {
        name: "Bit",
        ext: new ComponentExtension(bitExt)
      },
      {
        name: "Block",
        ext: new ComponentExtension(blockExt)
      }
    ];
    const extensions = opts.extensions ? baseExtensions.concat(opts.extensions) : baseExtensions;

    // Build filters
    const baseFilters = [
      {
        name: "linebreaks",
        fn: function (txt) {
          return txt
            .split("\r\n").join("\n").split("\n")
            .filter(x => x.trim().length)
            .map(x => `<p>${x}</p>`)
            .join("\n");
        }
      },
      {
        name: "slugify",
        fn: function (txt, opts) {
          return slug(txt, opts);
        }
      }
    ];
    const filters = opts.filters ? baseFilters.concat(opts.filters) : baseFilters;

    // Initialize loader
    const loader = new FileSystemLoader();
    loader.init(opts.loaderPaths, loaderOptions);

    // Initialize environment
    this.env = new Environment(loader, envOptions);
    for (let filter of filters) {
      this.env.addFilter(filter.name, filter.fn);
    }
    for (let ext of extensions) {
      this.env.addExtension(ext.name, ext.ext);
    }
  }
}