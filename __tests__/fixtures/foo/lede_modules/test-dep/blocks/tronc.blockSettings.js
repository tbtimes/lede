
const AmlResolver = require("../../../../../../__mocks__/AmlResolver").default;

class SettingsConfig {
  constructor() {
    this.source = new AmlResolver();
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;
