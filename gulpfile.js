const gulp = require('gulp');
const ts = require('gulp-typescript');
const watch = require('gulp-watch');
const typedoc = require('gulp-typedoc');
const chmod = require('gulp-chmod');
const srcmap = require('gulp-sourcemaps');

const projectOpts = ts.createProject({
  target: "es6",
  module: "commonjs",
  noImplicitAny: false,
  declaration: false,
  noExternalResolve: true
});

gulp.task("docs", () => {
  return gulp.src('src/**/*.ts')
    .pipe(typedoc({
                   module: "commonjs",
                   target: "es6",
                   includeDeclarations: true,
                   out: "docs/",
                   ignoreCompilerErrors: true
                 }))
});

gulp.task('source', () => {
  let result = gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe(srcmap.init())
    .pipe(ts(projectOpts));

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
    .pipe(srcmap.write())
    .pipe(gulp.dest('dist/'))
});

gulp.task('dev', ['source'], () => {
  watch('src/**/*.ts', () => {
    gulp.start('source');
  });
});