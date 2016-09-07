class SettingsConfig {
  constructor() {
    this.deployPath = "pageTwo/should/deploy/here";
    this.blocks = ["header", "article", "footer"];
    this.materials = {
      scripts: [],
      styles: [],
      assets: []
    };
    this.resources = {};
    this.meta = [];
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;