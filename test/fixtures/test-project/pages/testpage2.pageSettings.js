const resolve = require("path").resolve;

class SettingsConfig {
  constructor() {
    this.deployPath = "another-great-seo-headline";
    this.blocks = ["header", "article", "footer"];
    this.materials = {
      scripts: [
        { location: resolve(__dirname, "..", "scripts", "a.js"), as: "a.js" },
        { location: resolve(__dirname, "..", "scripts", "b.js"), as: "b.js" },
        { location: resolve(__dirname, "..", "scripts", "c.js"), as: "a.js" },
      ],
      styles: [
        { location: resolve(__dirname, "..", "styles", "a.scss"), as: "a.scss" },
        { location: resolve(__dirname, "..", "styles", "b.scss"), as: "b.scss" },
        { location: resolve(__dirname, "..", "styles", "c.scss"), as: "a.scss" }
      ],
      assets: []
    };
    this.resources = {};
    this.meta = [];
    this.seo = {
      title: "A test"
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;