const resolvers = require("../../../../dist/resolvers");

class SettingsConfig {
  constructor() {
    this.source = new resolvers.AmlResolver("1yET-AtSiVJ1L3R0YVt50GfBJHsq242-oltepsxO6FXQ", process.env.GAPI_KEY);
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;