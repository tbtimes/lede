class SettingsConfig {
  constructor() {
    this.name = __dirname;
    this.deployPath = "pageOne/should/deploy/here";
    this.materials = {
      scripts: [],
      styles: [],
      assets: []
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;