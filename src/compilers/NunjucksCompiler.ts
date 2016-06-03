import { Environment, FileSystemLoader} from 'nunjucks';
import { join } from 'path';

import NunjucksDefaultBaseContext from '../models/NunjucksDefaultBaseContext';
import { CompilerOptions } from '../interfaces/nunjucks';

export default class NunjucksCompiler {
    private options: CompilerOptions;
    private env: Environment;

    constructor(templatePath = join(process.cwd(), '/templates'), opts = {}) {
        const DEFAULTS = {
            loaders: [new FileSystemLoader(templatePath, {watch: false, noCache: false})],
            envOpts: {
                autoescape: false,
                throwOnUndefined: true,
                trimBlocks: false,
                lstripBlocks: false
            },
            filters: [],
            baseContext: new NunjucksDefaultBaseContext()
        };
        this.options = Object.assign({}, DEFAULTS, opts);
        this.env = new Environment(this.options.loaders, this.options.envOpts);
        
        for (let filter of this.options.filters) {
            this.env.addFilter(filter.name, filter.func, filter.async);
        }
    }

    public renderTemplate(templateName, ctx = {}): Promise<string> {
        let context = Object.assign({}, this.options.baseContext, ctx);
        return new Promise((resolve, reject) => {
            this.env.render(templateName, context, (err, res) => {
                if (err) reject(err);
                resolve(res.toString());
            })
        })
    }
}