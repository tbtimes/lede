const gulp = require('gulp');
const ts = require('gulp-typescript');
const watch = require('gulp-watch');
const typedoc = require('gulp-typedoc');
const chmod = require('gulp-chmod');
const srcmap = require('gulp-sourcemaps');
const path = require('path');
const merge = require('merge2');

const projectOpts = ts.createProject({
  target: "es6",
  module: "commonjs",
  noImplicitAny: false,
  declaration: true,
  noExternalResolve: true
});

gulp.task("docs", () => {
  return gulp.src('src/**/*.ts')
    .pipe(typedoc({
       module: "commonjs",
       target: "es6",
       out: "docs/",
       ignoreCompilerErrors: true,
     }))
});

gulp.task('source', () => {
  let result = gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe(srcmap.init())
    .pipe(ts(projectOpts));

  return merge([
    result.js
      .pipe(chmod({
        owner: {
          read: true,
          write: true,
          execute: true
        },
        group: {
          execute: true
        },
        others: {
          execute: true
        }
      }))
      .pipe(srcmap.write({sourceRoot: path.resolve(__dirname, "src")}))
      .pipe(gulp.dest('dist/')),
    result.dts.pipe(gulp.dest('dist/definitions'))
  ]);
});

gulp.task('dev', ['source'], () => {
  watch('src/**/*.ts', () => {
    gulp.start('source');
  });
});