const join = require("path").join;

class SettingsConfig {
  constructor() {
    this.context = { foo: "bar" };
    this.script = join(__dirname, "test.js");
    this.style = join(__dirname, "test.scss");
    this.html = join(__dirname, "test.html");
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;