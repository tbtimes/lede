"use strict";
const fs_1 = require('fs');
const node_sass_1 = require('node-sass');
class SassCompiler {
    constructor(opts) {
        this.options = {
            includePaths: [],
            outputStyle: 'compact',
            sourceComments: false,
            sourceMapEmbed: false
        };
        if (opts) {
            this.options = Object.assign(this.options, opts);
        }
    }
    compileSingle(fullyQualifiedFilePath) {
        let stream = fs_1.createReadStream(fullyQualifiedFilePath);
        let data = "";
        return new Promise((resolve, reject) => {
            stream.on('data', (d) => data += d.toString());
            stream.on('end', () => {
                resolve(this.renderSass(data.toString()));
            });
            stream.on('error', reject);
        });
    }
    run(paths) {
        let proms = [];
        for (let file of paths) {
            proms.push(this.compileSingle(file));
        }
        return Promise.all(proms);
    }
    renderSass(data) {
        return new Promise((resolve, reject) => {
            node_sass_1.render({
                data: data,
                includePaths: this.options.includePaths,
                outputStyle: this.options.outputStyle,
                sourceMapEmbed: this.options.sourceMapEmbed,
                sourceComments: this.options.sourceComments
            }, (err, res) => {
                if (err)
                    reject(err);
                resolve(res.css.toString());
            });
        });
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SassCompiler;
