/// <reference path="globals/aws-sdk/index.d.ts" />
/// <reference path="globals/babel-core/index.d.ts" />
/// <reference path="globals/babel-template/index.d.ts" />
/// <reference path="globals/babel-traverse/index.d.ts" />
/// <reference path="globals/babel-types/index.d.ts" />
/// <reference path="globals/babelify/index.d.ts" />
/// <reference path="globals/babylon/index.d.ts" />
/// <reference path="globals/browserify/index.d.ts" />
/// <reference path="globals/chokidar/index.d.ts" />
/// <reference path="globals/fs-extra/index.d.ts" />
/// <reference path="globals/glob/index.d.ts" />
/// <reference path="globals/lodash/index.d.ts" />
/// <reference path="globals/minimatch/index.d.ts" />
/// <reference path="globals/node-sass/index.d.ts" />
/// <reference path="globals/node/index.d.ts" />
/// <reference path="globals/nunjucks/index.d.ts" />
/// <reference path="globals/rimraf/index.d.ts" />
/// <reference path="modules/mime/index.d.ts" />
/// <reference path="modules/minimist/index.d.ts" />
/// <reference path="modules/slug/index.d.ts" />
declare namespace archieml {
  interface AmlOptions {
    comments: boolean;
  }
  function load(content: string, opts?: AmlOptions): any;
}

declare module "archieml" {
  export = archieml;
}