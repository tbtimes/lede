const gulp = require('gulp');
const ts = require('gulp-typescript');
const srcmap = require('gulp-sourcemaps');
const path = require('path');
const merge = require('merge2');
const tslint = require('gulp-tslint');
const rmrf = require("rimraf");
const rollup = require("gulp-rollup");
const tscript = require("rollup-plugin-typescript");
const nodeResolve = require("rollup-plugin-node-resolve");
const rollupPreset = require("babel-preset-es2015-rollup");
const commonjs = require("rollup-plugin-commonjs");
const json = require("rollup-plugin-json");
const rename = require("gulp-rename");
const babel = require("rollup-plugin-babel");


const projectOpts = ts.createProject({
  target: "es6",
  module: "commonjs",
  noImplicitAny: false,
  declaration: true,
  noResolve: true,
  allowSyntheticDefaultImports: true
});

// This is for publishing, it throws on error
gulp.task("prepare", () => {

  // Bundle code with rollup
  return gulp.src("src/**/*.ts")
    .pipe(rollup({
      allowRealFiles: true,
      rollup: require("rollup"),
      dest: "index.js",
      entry: "./src/index.ts",
      format: "cjs",
      external: [
        "node-sass",
        "slug",
        "chokidar",
        "sander",
        "glob-promise",
        "assert",
        "buffer",
        "child_process",
        "cluster",
        "console",
        "constants",
        "crypto",
        "dgram",
        "dns",
        "fs",
        "http",
        "https",
        "net",
        "os",
        "path",
        "process",
        "stream",
        "domain",
        "module",
        "url",
        "util",
        "vm"
      ],
      plugins: [
        tscript({ typescript: require("typescript") }),
        json(),
        babel({ presets: [rollupPreset], exclude: "node_modules/**" }),
        nodeResolve({ jsnext: true, main: true, extensions: [".js", ".json"] }),
        commonjs({
          sourceMap: false,
          namedExports: {
            "node_modules/archieml/archieml.js": ["load"]
          }
        }),
      ]
    }))
    .pipe(rename({extname: ".js"}))
    .pipe(gulp.dest("dist/"))
    .on("error", (e) => {throw e});
});

// This will not throw on errors, just report them. For developing.
gulp.task('source', () => {
  let result = gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe(srcmap.init())
    .pipe(projectOpts());

  return merge([
    result.js
      .pipe(srcmap.write({sourceRoot: path.resolve(__dirname, "src")}))
      .pipe(gulp.dest('dist/')),
    result.dts.pipe(gulp.dest('dist/'))
  ]);
});

// Clean out the dist/ directory
gulp.task("clean", () => {
  rmrf.sync("dist/")
});

// This will throw on errors. For publishing.
gulp.task('lint', () => {
  gulp.src('src/**/*.ts')
    .pipe(tslint({
      formatter: "verbose"
    }))
    .pipe(tslint.report());
});

// Generate definition files for publishing, will throw on err
gulp.task("gen-dt", () => {
  const res = gulp.src(["src/**/*.ts", "typings/**/*.ts"])
    .pipe(projectOpts())
    .on("error", err => {throw err});

  res.dts.pipe(gulp.dest("defs/"))
});

// Run tasks before publishing to npm. Will throw on errors.
gulp.task('pub', ["clean", 'lint', "gen-dt", 'prepare']);

// This will report errors and swallow them so that dev doesn't restart
gulp.task('dev', ["clean", 'source'], () => {
  gulp.watch('src/**/*.ts', ["source", "lint"]).on("error", () => {});
});