const path = require('path');
const fs = require('fs');

class SettingsConfig {
  constructor() {
    // This property specifies the base path on which to look for projects in the inheritance chain.
    this.inheritanceRoot = path.join(__dirname, '..');

    // This property specifies the chain of projects from which this project inherits styles, scripts, and templates.
    // When compiling assets, the resolvers crawl this chain in order and pull the first matching asset name they find.
    // Projects listed here resolve to absolute path in the form of `${this.inheritanceRoot}/${this.projectName}` where
    // projectName is a string from inheritanceChain.
    this.inheritanceChain = [];

    // This property specifies which CSS Preprocessor the project uses. Leaving it null or undefined resolves to the
    // default, SassCompiler.
    this.CSSPreprocessor = null;

    // This property specifies which Template Assembler the project uses. Leaving it null or undefined resolves to
    // the default, NunjucksCompiler.
    this.HtmlTemplateAssembler = null;

    // This property specifies which Javascript Preprocessor the project uses. Leaving it null or undefined resolve to
    // the default, ES6Compiler.
    this.JSPreprocessor = null;

    // This property specifies what content will populate the project. It can be an array of content objects or it can
    // be and object in the form of { fileId: 'string', apiKey: 'string', parseFn: Function } where apiKey is a string 
    // containing a googleapis key and where fileId is a string identifying a google doc. 
    // The ContextAssembler will fetch the specifie google doc and parse it using the specified parseFn. If no parseFn
    // is present, Lede will default to using the archieml parser and assign the result to the content property on the
    // project's context.
    this.contentLoop = {
      apiKey: fs.readFileSync(path.join(__dirname, '/googleapikey.txt')).toString(),
      fileId: "1PokALcLuibzWcgOyLVCSpWvIrr9myRN-hH1IMxKE4EI",
      parseFn: null
    };

    // This property specifies how the image resizer should map the outputs. It is currently unimplemented and has no defaults.
    this.imageMap = null;
    
    // This boolean toggles various debug settings in Lede
    this.debug = true;
    
    // This sets the page from which nunjucks should inherit as base. Defaults to "base.html";
    this.shellPage = null;
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;