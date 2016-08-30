const gulp = require('gulp');
const ts = require('gulp-typescript');
const watch = require('gulp-watch');
const srcmap = require('gulp-sourcemaps');
const path = require('path');
const merge = require('merge2');
const tslint = require('gulp-tslint');

const projectOpts = ts.createProject({
  target: "es6",
  module: "commonjs",
  noImplicitAny: false,
  declaration: true,
  noExternalResolve: true
});

gulp.task('source', () => {
  let result = gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe(srcmap.init())
    .pipe(ts(projectOpts));

  return merge([
    result.js
      .pipe(srcmap.write({sourceRoot: path.resolve(__dirname, "src")}))
      .pipe(gulp.dest('dist/')),
    result.dts.pipe(gulp.dest('dist/'))
  ]);
});

gulp.task('lint', () => {
  gulp.src('src/**/*.ts')
    .pipe(tslint({
      formatter: "verbose"
    }))
    .pipe(tslint.report());
});

gulp.task('pub', ['lint', 'source']);

gulp.task('dev', ['source'], () => {
  watch('src/**/*.ts', () => {
    gulp.start('source');
  });
});