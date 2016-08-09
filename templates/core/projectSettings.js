const path = require('path');
const os = require('os');

class SettingsConfig {
  constructor() {
    this.name = "core";
    this.inheritanceRoot = process.env.LEDE_HOME ? path.resolve(os.homedir(), process.env.LEDE_HOME) : path.resolve(os.homedir(), "LedeProjects");
    this.dependsOn = [];
    // point to project files for customization
    this.styles = [];
    this.scripts = [];
    this.blocks = [];
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
