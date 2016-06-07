import { SassCompiler, NunjucksCompiler } from '../compilers';
import { ProjectSettings } from '../interfaces/settings';

import { join } from 'path';

export default class DefaultProjectSettings implements ProjectSettings {
    inheritanceRoot = join(__dirname, '.locals/');
    inheritanceChain = [];
    CSSPreprocessor = new SassCompiler();
    HtmlTemplateAssembler = new NunjucksCompiler();
    JSPreprocessor = null;
    imageMap = null;
    contentLoop = [];
    debug = true;
    inheritancePathMap = {
        html: (basePath) => {
            return basePath + '/templates';
        },
        css: (basePath) => {
            return basePath + '/styles';
        },
        js: (basePath) => {
            return basePath + '/scripts';
        }
    };
    shellPage = 'base.html'; 
}