const path = require('path');

class SettingsConfig {
  constructor() {
    this.inheritanceChain = ['test-proj2'];
    this.inheritanceRoot = path.join(__dirname, '..');
  }
}

Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;