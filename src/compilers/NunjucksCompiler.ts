// import * as path from 'path';
//
// const TemplateModelFactory = require('../models/TemplateModelFactory');
// import { Environment, FileSystemLoader } from 'nunjucks';
//
// export default class NunjucksCompiler {
//   options;
//   env;
//
//   constructor(templatePath = path.join(process.cwd(), '/templates'), opts = {}) {
//     const DEFAULTS = {
//       loaders: [new FileSystemLoader(templatePath, {watch: false, noCache: false})],
//       envOpts: {
//         autoescape: false,
//         throwOnUndefined: true,
//         trimBlocks: false,
//         lstripBlocks: false
//       },
//       filters: [],
//       baseContext: TemplateModelFactory.getDefaultNunjucksModel()
//     };
//
//     this.options = Object.assign({}, DEFAULTS, opts);
//    
//     this.env = new Environment(this.options.loaders, this.options.envOpts);
//
//     for (let filter of this.options.filters) {
//       this.env.addFilter(filter.name, filter.func, filter.async);
//     }
//    
//   }
//
//   renderTemplate(templateName, ctx = {}) {
//     let context = Object.assign({}, this.options.baseContext, ctx);
//     return new Promise((resolve, reject) => {
//       this.env.render(templateName, context, (err, res) => {
//         if (err) reject(err);
//         resolve(Buffer.from(res, 'utf8'));
//       })
//     });
//   }
//
//
// }