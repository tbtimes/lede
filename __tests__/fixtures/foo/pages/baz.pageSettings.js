
class SettingsConfig {
  constructor() {
    this.deployPath = "a-great-seo-headline"
    this.blocks = [];
    this.materials = {
      scripts: [],
      styles: [],
      assets: []
    };
    this.resources = {
      head: [],
      body: []
    };
    this.meta = [];
    this.context = {
      seo: {
        title: "baz page"
      }
    }
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
