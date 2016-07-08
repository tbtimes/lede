const path = require('path');
const fs = require('fs');

class SettingsConfig {
  constructor() {
    this.name = "myProject";
    this.inheritanceRoot = path.join(__dirname, '..');
    this.dependsOn = ['baseProject'];
    this.contentResolver = {
      apiKey: fs.readFileSync(path.join(__dirname, '/googleapikey.txt')).toString(),
      fileId: "1PokALcLuibzWcgOyLVCSpWvIrr9myRN-hH1IMxKE4EI",
      parseFn: null
    };
    this.styles = ["baseProject/baseProjectStyles.scss", "myProject/myProjectStyles.scss"];
    this.scripts = ["baseProject/logger.js"];
    this.blocks = ["BITLOOP", "myProject/sideBar.html"];
    this.bitLoop = "content"
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;