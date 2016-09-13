const resolve = require("path").resolve;

class SettingsConfig {
  constructor() {
    this.deployPath = "a-great-seo-headline";
    this.blocks = ["header"];
    this.materials = {
      scripts: [
        resolve(__dirname, "..", "scripts", "a.js"),
        resolve(__dirname, "..", "scripts", "b.js"),
        resolve(__dirname, "..", "scripts", "c.js"),
      ],
      styles: [
        resolve(__dirname, "..", "styles", "a.scss"),
        resolve(__dirname, "..", "styles", "b.scss"),
        resolve(__dirname, "..", "styles", "c.scss")
      ],
      assets: []
    };
    this.resources = {};
    this.meta = [];
    this.seo = {
      title: "Another test"
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;