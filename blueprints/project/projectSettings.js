const path = require('path');
const fs = require('fs');

class SettingsConfig {
  constructor() {
    this.inheritanceChain = ['test', 'base'];
    this.inheritanceRoot = path.join(__dirname, '..');
    this.contentLoop = {
      apiKey: fs.readFileSync(path.join(__dirname, '../../googleapikey.txt')).toString(),
      fileId: "1PokALcLuibzWcgOyLVCSpWvIrr9myRN-hH1IMxKE4EI"
    }
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;