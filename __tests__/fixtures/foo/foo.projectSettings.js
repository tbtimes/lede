
class SettingsConfig {
  constructor() {
    this.deployRoot = "test";
    this.defaults = {
      scripts: [],
      assets: [],
      styles: [],
      blocks: [],
      metaTags: []
    };
    this.context = {
      foo: "bar"
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
