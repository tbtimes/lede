import { Environment, FileSystemLoader} from 'nunjucks';
import { join } from 'path';

import NunjucksDefaultBaseContext from '../models/NunjucksDefaultBaseContext';
import { CompilerOptions } from '../interfaces/nunjucks';
import { HtmlTemplateAssembler } from '../interfaces/compilers';

export class NunjucksCompiler implements HtmlTemplateAssembler {
    private options: CompilerOptions;
    private env: Environment;
    private blocksInsert: string;

    constructor(opts = {}){
        this.options = opts;
    }
    
    public configure(templatePaths: string|Array<string>): this {
        const DEFAULTS = {
            loaders: [new FileSystemLoader(templatePaths, {watch: false, noCache: false})],
            envOpts: {
                autoescape: false,
                throwOnUndefined: true,
                trimBlocks: false,
                lstripBlocks: false
            },
            filters: [],
            baseContext: new NunjucksDefaultBaseContext()
        };
        this.options = Object.assign({}, DEFAULTS, this.options);
        this.env = new Environment(this.options.loaders, this.options.envOpts);
        
        for (let filter of this.options.filters) {
            this.env.addFilter(filter.name, filter.func, filter.async);
        }

        return this;
    }
    
    public renderTemplate(broaderContext): Promise<string> {
        let context = Object.assign({}, this.options.baseContext, broaderContext.context);
        this.buildBlocks(broaderContext);

        return new Promise((resolve, reject) => {
            console.log(this.blocksInsert);
            this.env.renderString(this.blocksInsert, context, (err, res) => {
                if (err) reject(err);
                resolve(res);
            })
        })
    }

    private buildBlocks(ctx) {
        this.blocksInsert = `
            {% extends "${ctx.projectSettings.shellPage}" %}
            
            {% block content %}
            {% for bit in content %}{% include bit.tmpl %}{% endfor %}
            {% endblock %}
            
            {% block scripts %}
            <h2>pest</h2>
            {% endblock %}
            
            {% block styles %}
            <h2>test</h2>
            {% endblock %}
            
        `;
    }
}