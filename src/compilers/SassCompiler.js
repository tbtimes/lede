import * as sass from 'node-sass'
const concat = require('../utils/bufferStreamPromise');
import * as fs from 'fs';

export default class SassCompiler {
  options;
  
  constructor(opts = {}) {
    const DEFAULTS = {
      includePaths: [], 
      outputStyle: 'compact', 
      comments: false, 
      sourceMap: false
    };
    
    this.options = Object.assign({}, DEFAULTS, opts);
  }
  
  compileSingle(fullyQualifiedFilePath) {
    let stream = fs.createReadStream(fullyQualifiedFilePath);
    return stream.pipe(concat()).then(this.processSassBuffer.bind(this))
  }
  
  run(arrayOfFullyQualifiedFilePaths) {
    let proms = [];
    for (let file of arrayOfFullyQualifiedFilePaths) {
      proms.push(this.compileSingle(file));
    }
    return Promise.all(proms);
  }
  
  // Internals
  processSassBuffer(buffer) {
    let data = buffer.toString();
    return new Promise((resolve, reject) => {
      sass.render({
        data: data,
        includePaths: this.options.includes,
        outputStyle: this.options.outputStyle,
        sourceMapEmbed: this.options.sourceMap,
        sourceComments: this.options.comments
      }, (err, res) => {
        if (err) reject(err);
        else resolve(res.css);
      });
    })
  }
}