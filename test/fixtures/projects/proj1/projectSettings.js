const path = require('path');

class SettingsConfig {
  constructor() {
    this.name = "proj1";
    this.inheritanceRoot = path.resolve(__dirname, "..");
    this.dependsOn = ["proj2"];
    this.styles = [];
    this.scripts = [];
    this.blocks = [];
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
