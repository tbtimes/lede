const path = require('path');
const fs = require('fs');

class SettingsConfig {
  constructor() {
    this.name = "2";
    this.inheritanceRoot = path.join(__dirname, '..');
    this.dependsOn = ['sample-project3', 'sample-project4'];
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;