
class SettingsConfig {
  constructor() {
    this.deployPath = "a-great-seo-headline";
    this.blocks = ["header"];
    this.materials = {
      scripts: [
        { id: "tester/a.js" },
        { id: "tester/b.js" },
        { id: "tester/c.js" },
      ],
      styles: [
        { id: "tester/a.scss" },
        { id: "tester/b.scss" },
        { id: "tester/c.scss" },
      ],
      assets: [
        { id: "tester/a.json" },
        { id: "tester/b.json" },
        { id: "tester/c.json" },
      ]
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