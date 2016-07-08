import { Environment, FileSystemLoader, Template } from "nunjucks";
import { ProjectReport } from "../interfaces/ProjectReport";
import { readStreamProm } from "../utils";


export class NunjucksCompiler {

  constructor() {}

  async compile(report: ProjectReport, compilers) {
    let bits = NunjucksCompiler.getUsedBits(report);
    let stylesBlock = await NunjucksCompiler.createStyleBlock(report, bits, compilers.css);
    let scriptsBlock = await NunjucksCompiler.createScriptsBlock(report, bits, compilers.js);
    let shell = await NunjucksCompiler.createShell(report, stylesBlock, scriptsBlock);
    return await NunjucksCompiler.renderTemplate(report, shell);
    // let stylesBlock = await NunjucksCompiler.createStyleBlock(report, styles);
    // let shell = await NunjucksCompiler.createShell(report, stylesBlock);
    // return await NunjucksCompiler.renderTemplate(report, shell);
  }
  
  static async createScriptsBlock(report: ProjectReport, bits, compiler) {
    let scripts = await compiler.compile(report, bits);
    return `
<!--Globals-->
<script>
${scripts.globals}
</script>
<!--Bits-->
<script>
${scripts.bits}
</script>
`
  }
  
  static getUsedBits (report: ProjectReport) {
    let visitedBits = [];
    for (let bit of report.context.content[report.bitLoop]) {
      if (!(visitedBits.indexOf(bit.tmpl) > -1)) {
        visitedBits.push(bit.tmpl);
      }
    }
    return visitedBits;
  }

  static async renderTemplate(report: ProjectReport, template) {
    let env = new Environment(new FileSystemLoader(`${report.workingDirectory}/.ledeCache/bits`, {
      watch: false,
      noCache: true
    }));
    let tmpl = new Template(template, env);
    return tmpl.render(report.context);
  }

  static async createStyleBlock(report: ProjectReport, bits, compiler) {
    let styles = await compiler.compile(report, bits);
    return `
<!--Globals-->
<style>
${styles.globals}
</style>
<!--Bits-->
<style>
${styles.bits}
</style>
`;
    // let styleBlock = `{% block styles %}
    // <style>
    // ${styles.globals}
    // </style>
    // `;
    // let visitedBits = [];
    // for (let bit of report.context.content[report.bitLoop]) {
    //   if (!(visitedBits.indexOf(bit.tmpl) > -1)) {
    //     styleBlock += `<style>${styles.bits[bit.tmpl]}</style>`;
    //     visitedBits.push(bit.tmpl);
    //   }
    // }
    // styleBlock += "{% endblock %}";
    // return styleBlock
  }

  static async createShell(report: ProjectReport, stylesBlock, scriptsBlock) {
    let pageTop = `
<!DOCTYPE html>

<html>
<head>
  <title>{{seo.title}}</title>
  {% for item in seo.meta -%}
  <meta{%if item.name %} name="{{item.name}}"{% endif %}{% if item.content %} content="{{item.content}}"{% endif %}{% if item.props | length %}{% for prop in item.props %} {{prop.prop}}="{{prop.val}}"{% endfor %}{% endif %} />
  {% endfor %}{% if debug -%}
  <meta NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
  {%- endif %}
  ${stylesBlock}
</head>
<body>
`;
    let pageBottom = `
  ${scriptsBlock}
</body>
</html>
`;
    let middle = '';
    for (let block of report.blocks) {
      if (block !== 'BITLOOP') {
        middle += await readStreamProm(`${report.workingDirectory}/.ledeCache/blocks/${block}`);
      } else {
        middle += `
          {% for bit in content.${report.bitLoop} %}{% include bit.tmpl + "/tmpl.html" %}
          {% endfor %}
        `
      }

    }

    return pageTop + middle + pageBottom;
  }
}