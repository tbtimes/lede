import { Environment, FileSystemLoader, Template } from "nunjucks";
import { join } from 'path';

import { readStreamProm } from "../utils";


export default class NunjucksCompiler {

  constructor() {}

  async compile(report, compilers) {
    let bits = NunjucksCompiler.getUsedBits(report);
    let stylesBlock = await NunjucksCompiler.createStyleBlock(report, bits, compilers.css);
    let scriptsBlock = await NunjucksCompiler.createScriptsBlock(report, bits, compilers.js);
    let shell = await NunjucksCompiler.createShell(report, stylesBlock, scriptsBlock);
    return {
      index: await NunjucksCompiler.renderTemplate(report, shell),
      scripts: scriptsBlock,
      styles: stylesBlock,
      cachePath: join(report.workingDirectory, '.ledeCache')
    };
  }
  
  static async createScriptsBlock(report, bits, compiler) {
    let scripts = await compiler.compile(report, bits);
    return {
      file: 'globalScripts.js',
      data: `
// GLOBALS
${scripts.globals}
// BITS
${scripts.bits}
`
    }
  }
  
  static getUsedBits (report) {
    let visitedBits = [];
    if (report.context.content.ARTICLE) {
      for (let bit of report.context.content.ARTICLE) {
        if (!(visitedBits.indexOf(bit.tmpl) > -1)) {
          visitedBits.push(bit.tmpl);
        }
      }
    }
    return visitedBits;
  }

  static async renderTemplate(report, template) {
    let env = new Environment(new FileSystemLoader(join(report.workingDirectory, '.ledeCache', 'bits'), {
      watch: false,
      noCache: true
    }));
    let tmpl = new Template(template, env);
    return tmpl.render(report.context);
  }

  static async createStyleBlock(report, bits, compiler) {
    let styles = await compiler.compile(report, bits);
    return {
      file: 'globalStyles.css',
      data: `
/* GLOBALS */
${styles.globals}
/* BITS */
${styles.bits}
`};
  }

  static async createShell(report, stylesBlock, scriptsBlock) {
    let pageTop = `
<!DOCTYPE html>

<html>
<head>
  <title>{{seo.title}}</title>
  {% for item in seo.meta -%}
  <meta{%if item.name %} name="{{item.name}}"{% endif %}{% if item.content %} content="{{item.content}}"{% endif %}{% if item.props | length %}{% for prop in item.props %} {{prop.prop}}="{{prop.val}}"{% endfor %}{% endif %} />
  {% endfor %}{% if $debug -%}
  <meta NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
  {%- endif %}
  <link rel="stylesheet" type="text/css" href="${stylesBlock.file}">
</head>
<body>
`;
    let pageBottom = `
  <script type="text/javascript" src="${scriptsBlock.file}"></script>
  {%if $debug %}
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script>{% endif %}
</body>
</html>
`;
    let middle = '';
    for (let block of report.blocks) {
      if (block !== 'ARTICLE') {
        middle += await readStreamProm(join(report.workingDirectory, '.ledeCache', 'blocks', block));
      } else {
        middle += `<article id="ledeRoot" class="container">
          <div class="row">
            <div class="col-lg-8 col-lg-offset-2 main-column">
            {% for bit in content.ARTICLE %}{% include bit.tmpl + "/tmpl.html" %}
            {% endfor %}
            </div>
          </div>
        </article>`
      }

    }

    return pageTop + middle + pageBottom;
  }
}