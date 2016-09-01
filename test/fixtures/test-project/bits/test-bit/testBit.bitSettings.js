// import { Material } from "./";
//
// export interface Bit {
//   version: Number;
//   namespace: string;
//   name: string;
//   context?: any;
//   script?: Material;
//   style?: Material;
//   html?: Material;
// }

class SettingsConfig {
  constructor() {
    this.version = 0;
    this.context = { foo: "bar" };
    this.script = "test.js";
    this.style = "test.scss";
    this.html = "test.html";
  }
}

// DO NOT CHANGE ANYTHING BELOW THIS LINE
// These two lines are necessary for lede to pull in this module at runtime.
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = SettingsConfig;