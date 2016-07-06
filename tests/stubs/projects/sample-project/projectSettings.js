const path = require('path');
const fs = require('fs');

class SettingsConfig {
  constructor() {
    this.name = "1";
    this.inheritanceRoot = path.join(__dirname, '..');
    this.dependsOn = ['sample-project2'];
    this.contentResolver = {
      apiKey: fs.readFileSync(path.join(__dirname, '/googleapikey.txt')).toString(),
      fileId: "1PokALcLuibzWcgOyLVCSpWvIrr9myRN-hH1IMxKE4EI",
      parseFn: null
    };
    this.styles = [];
    this.scripts = [];
    this.blocks = [];
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;