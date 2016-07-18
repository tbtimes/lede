const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const watch = require('gulp-watch');
const typedoc = require('gulp-typedoc');
const chmod = require('gulp-chmod');
const srcmap = require('gulp-sourcemaps');

const projectOpts = ts.createProject({
  target: "es6",
  module: "commonjs",
  noImplicitAny: false,
  declaration: true,
  noExternalResolve: true
});

const testOpts = ts.createProject({
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
                   includeDeclarations: true,
                   out: "docs/",
                   ignoreCompilerErrors: true
                 }))
})

gulp.task('source', () => {
  let result = gulp.src(['src/**/*.ts', 'typings/**/*.ts'])
    .pipe(srcmap.init())
    .pipe(ts(projectOpts));

  return merge([
    result.dts.pipe(gulp.dest('dist/')),
    result.js.pipe(chmod({
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
  ])
});

gulp.task('copy', () => {
  return gulp.src('tests/stubs/**/*')
    .pipe(gulp.dest('spec/stubs'));
});

gulp.task('test', () => {
  return gulp.src(['tests/**/*.ts', 'typings/**/*.ts', 'dist/**/*.ts'])
    .pipe(ts(testOpts))
    .js.pipe(gulp.dest('spec/'))
});

gulp.task('dev', ['source', 'test', 'copy'], () => {
  watch('tests/**/*.ts', () => {
    gulp.start('test');
  });
  watch('src/**/*.ts', () => {
    gulp.start('source');
  });
  watch('test/stubs/**/*', () => {
    gulp.start('copy');
  });
});