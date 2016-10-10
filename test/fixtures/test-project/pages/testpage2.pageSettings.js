
class SettingsConfig {
  constructor() {
    this.deployPath = "another-great-seo-headline";
    this.blocks = ["header", "article", "footer"];
    this.materials = {
      scripts: [
        { id: "tester/a.js", as: "a.js" },
        { id: "tester/b.js", as: "b.js" },
        { id: "tester/c.js", as: "a.js" },
      ],
      styles: [
        { id: "tester/a.scss", as: "a.scss" },
        { id: "tester/b.scss", as: "b.scss" },
        { id: "tester/c.scss", as: "a.scss" },
      ],
      assets: [
        { id: "tester/a.json", as: "a.json" },
        { id: "tester/b.json", as: "b.json" },
        { id: "tester/c.json", as: "a.json" },
      ]
    };
    this.resources = {};
    this.meta = [];
    this.context = {
      seo: {
        title: "A test"
      }
    };
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;