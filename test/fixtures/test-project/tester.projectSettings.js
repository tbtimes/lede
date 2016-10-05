class SettingsConfig {
  constructor() {
    this.deployRoot = "some-seo-root-path-here";
    this.defaults = {
      scripts: [],
      assets: [],
      styles: [],
      blocks: [],
      metaTags: []
    };
    this.context = { baz: "qux" };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;