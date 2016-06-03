import { createReadStream } from 'fs';
import { render, Options } from 'node-sass';

export default class SassCompiler {
    private options: Options = {
        includePaths: [],
        outputStyle: 'compact',
        sourceComments: false,
        sourceMapEmbed: false
    };

    constructor(opts?: Options) {
        if (opts) {
            this.options = (<any>Object).assign(this.options, opts);
        }
    }

    public compileSingle(fullyQualifiedFilePath: string): Promise<string> {
        let stream = createReadStream(fullyQualifiedFilePath);
        let data = "";
        return new Promise((resolve, reject) => {
            stream.on('data', (d) => data += d.toString());
            stream.on('end', () => {
                resolve(this.renderSass(data.toString()))
            });
            stream.on('error', reject)
        })
    }
    
    public run(paths: Array<string>): Promise<Array<string>> {
        let proms = [];
        for (let file of paths) {
            proms.push(this.compileSingle(file))
        }
        return Promise.all(proms);
    }

    private renderSass(data: string): Promise<string>{
        return new Promise((resolve, reject) => {
            render({
                data: data,
                includePaths: this.options.includePaths,
                outputStyle: this.options.outputStyle,
                sourceMapEmbed: this.options.sourceMapEmbed,
                sourceComments: this.options.sourceComments
            }, (err, res) => {
                if (err) reject(err);
                resolve(res.css.toString());
            });
        });
    }
}