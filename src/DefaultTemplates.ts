export const PAGE_TMPL = `
<div id="ledeRoot">
  {% asyncAll $block in $BLOCKS %}
    {% BLOCK $block %}
  {% endall %}
</div>
`;

export const BLOCK_TMPL = `
<div class="lede-block">
  {% asyncAll $bit in $block.$BITS %}
    {% BIT $bit %}
  {% endall %}
</div>
`;

export const PROJ_TMPL = function({styles, scripts, context}) {
  return `
<!Doctype html>
<html>
<head>
<title>{{ $PAGE.seo.title }}</title>
{% for item in $PAGE.meta %}
<meta{% if item.name %} name ="{{item.name}}"{% endif %}{%if item.content %} content="{{item.content}}"{% endif %}{% if item.props | length %}{% for prop in item.props %} {{prop.prop}}="{{prop.val}}"{% endfor %}{% endif %} />
{% endfor %}
{% if $PROJECT.$debug %}
<meta NAME="ROBOTS" Content="NOINDEX, NOFOLLOW">
{% endif %}
{% if $PAGE.$resources and $PAGE.$resources.head %}
{% for resource in $PAGE.$resources.head %}
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
${ context.$PAGE.$template }
{% if $PAGE.$resources and $PAGE.$resources.body %}
{% for resource in $PAGE.resources.body %}
{{ resource }}
{% endfor %}
{% endif %}
<script type="text/javascript" src="globalScripts.js"></script>
<script type="text/javascript" src="bitScripts.js"></script>
{% if $PROJECT.$debug %}
<script>
document.write('<script src="http://' + (location.host || 'localhost').split(":")[0] +
':35729/livereload.js?snipver=1></' + 'script>');
</script>
{% endif %}
</body>
</html>
`;
};