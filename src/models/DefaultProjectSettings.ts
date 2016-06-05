import { SassCompiler, NunjucksCompiler } from '../compilers';
import { ProjectSettings } from '../interfaces/settings';

export default class DefaultProjectSettings implements ProjectSettings {
    inheritanceRoot = process.cwd();
    inheritanceChain = [];
    CSSPreprocessor = new SassCompiler();
    HtmlTemplateAssembler = new NunjucksCompiler();
    JSPreprocessor = null;
    imageMap = null;
}