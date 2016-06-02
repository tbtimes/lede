const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const rmrf = require('rimraf');
const watch = require('gulp-watch');

gulp.task('clean', () => {
  return rmrf.sync('./dist/**')
});

gulp.task('js', () => {
  return gulp.src('./src/**/*.js')
    // .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['es2015'],
      plugins: ['add-module-exports', 'transform-class-properties']
    }))
    // .pipe(sourcemaps.write())
    .pipe(gulp.dest('./dist'))
});

gulp.task('dev', ['clean', 'js'], () => {
  watch("src/**/*.js", null, () => {
    gulp.start("js");
  });
});

gulp.task('default', ['clean', 'js']);