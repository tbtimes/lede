import { Environment, FileSystemLoader } from "nunjucks";
import * as slug from "slug";
import { join } from "path";

import { ComponentExtensionFactory } from "./ComponentExtension";
import { ProjectReport, Project } from "../models/Project";
import { Page } from "../models/Page";
import { Block } from "../models/Block";
import { BitReference } from "../models/Bit";
import { asyncMap } from "../utils";


export class NunjucksCompiler {
  env: Environment;

  constructor(opts: {
    filters?: any[],
    extensions?: any[],
    loaderOptions?: any,
    envOptions?: any,
    loaderPaths?: string[]
  }) {
    const loaderOptions = Object.assign({watch: false, noCache: true}, opts.loaderOptions || {});
    const envOptions = Object.assign({autoescape: false, watch: false, noCache: true}, opts.envOptions || {});

    // Build extensions
    const bitExt = {tags: ["BIT", "bit"], elementName: "$bit"};
    const blockExt = {tags: ["BLOCK", "block"], elementName: "$block"};
    const baseExtensions = [
      {
        name: "Bit",
        ext: new ComponentExtensionFactory(bitExt)
      },
      {
        name: "Block",
        ext: new ComponentExtensionFactory(blockExt)
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

  async compile({report, styles, scripts}: {report: ProjectReport, scripts: any, styles: any}) {
    let context = this.getContext(report);
    let pages = asyncMap(context, async(c) => {
      const pageStyles = {
        bits: styles["bits"][c["$PAGE"]["name"]],
        globals: styles["globals"][c["$PAGE"]["name"]]
      };
      const pageScripts = {
        bits: scripts["bits"][c["$PAGE"]["name"]],
        globals: scripts["bits"][c["$PAGE"]["name"]]
      };
      return await this.buildPage({context: c, styles: pageStyles, scripts: pageScripts});
    });
    return pages;
  }

  async buildPage({context, styles, scripts}) {
    const shell = `
<Doctype html>
<html>
<head>
<title>{{ $PAGE.seo.title }}</title>
{% for item in $PAGE.meta %}
<meta{% if item.name %} name="{{item.name}}"{% endif %}{% if item.content %} content="{{item.content}}"{% endif %}{% if item.props | length %}{% for prop in item.props %} {{prop.prop}}="{{prop.val}}"{% endfor %}{% endif %} />
{% endfor %}
{% if $PROJECT.debug %}
<meta NAME="ROBOTS" Content="NOINDEX, NOFOLLOW">
{% endif %}
{% if $PAGE.resources and $PAGE.resources.head %}
{% for resource in $PAGE.resources.body %}
{{ resource }}
{% endfor %}
{% endif %}
<!-- GLOBAL -->
<style>
${ styles.globals }
</style>
<!-- BITS -->
<style>
${ styles.bits }
</style>
</head>
<body>
${ context.$PAGE.template }
{% if $PAGE.resources and $PAGE.resources.body %}
{% for resource in $PAGE.resources.body %}
{{ resource }}
{% endfor %}
{% endif %}
<script type="text/javascript" src="globalScripts.js"></script>
<script type="text/javascript" src="bitScripts.js"></script>
{% if $PROJECT.debug %}
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script>
{% endif %}
</body>
</html>
`;
    const rendered = await this.renderPage({shell, context});
    return {
      renderedPage: rendered,
      path: join(context.$PROJECT.deployRoot, context.$PAGE.deployPath),
      files: [
        { name: "globalScripts.js", content: scripts.globals[context.$PAGE.name] },
        { name: "bitScripts.js", content: scripts.bits[context.$PAGE.name] }
      ]
    };
  }

  renderPage({shell, context}) {
    return new Promise((resolve, reject) => {
      this.env.renderString(shell, context, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });
  }

  getContext(report: ProjectReport) {
    return report.pages.map((page: Page) => {
      const blocks = page.blocks.map((blockName: string) => {
        const block: any = Object.assign({}, report.blocks.find(x => x.name === blockName));
        block.bits = block.bits.map((bit: BitReference) => {
          return report.bits.find(x => x.name === bit.bit);
        });
        return block;
      });
      return {
        $PROJECT: report.project,
        $PAGE: page,
        $BLOCKS: blocks
      };
    });
  }
}