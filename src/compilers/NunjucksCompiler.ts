import { Environment, FileSystemLoader } from 'nunjucks';


export class NunjucksCompiler {
  pageShell: string;

  constructor() {
    this.pageShell = `
<!DOCTYPE html>

<html>
<head>
  <title>{{seo.title}}</title>
  {% for item in seo.meta -%}
  <meta{%if item.name %} name="{{item.name}}"{% endif %}{% if item.content %} content="{{item.content}}"{% endif %}{% if item.props | length %}{% for prop in item.props %} {{prop.prop}}="{{prop.val}}"{% endfor %}{% endif %} />
  {% endfor %}{% if debug -%}
  <meta NAME="ROBOTS" CONTENT="NOINDEX, NOFOLLOW">
  {%- endif %}
  {% block styles -%}
  {%- endblock %}
</head>
<body>
  {% block content -%}
  {%- endblock %}

  {% block scripts -%}
  {%- endblock %}
</body>
</html>
`
  }
  
  buildBlocks(content) {
    
  }
}