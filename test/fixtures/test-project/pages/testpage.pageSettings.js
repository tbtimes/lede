const resolve = require("path").resolve;

class SettingsConfig {
  constructor() {
    this.deployPath = "pageOne/should/deploy/here";
    this.blocks = ["header"];
    this.materials = {
      scripts: [
        resolve(__dirname, "..", "scripts", "a.js"),
        resolve(__dirname, "..", "scripts", "b.js"),
        resolve(__dirname, "..", "scripts", "c.js"),
      ],
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