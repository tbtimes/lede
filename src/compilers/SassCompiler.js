import * as sass from 'node-sass'
const concat = require('../utils/bufferStreamPromise');
import * as fs from 'fs';

export default class SassCompiler {
  constructor(includePaths = [], outputStyle = 'compact', comments = false, sourceMap = false) {
    this.includes = includePaths;
    this.outputStyle = outputStyle;
    this.comments = comments;
    this.sourceMap = sourceMap
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
        includePaths: this.includes,
        outputStyle: this.outputStyle,
        sourceMapEmbed: this.sourceMap,
        sourceComments: this.comments
      }, (err, res) => {
        if (err) reject(err);
        else resolve(res.css);
      });
    })
  }
}