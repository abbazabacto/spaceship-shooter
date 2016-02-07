var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');

gulp.task('babelify', function () {
  return browserify({ entries: './src/game.js', debug: true })
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .on('error', gutil.log)
    .pipe(source('game.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    //.pipe(uglify())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'));
});

var browserSync = require('browser-sync').create();
var path = require('path');
var root = path.normalize(__dirname);

gulp.task('watch', ['babelify'], function(){
  browserSync.watch([
    path.join(root, 'src/**/*.js')
  ], function(){ gulp.start('babelify'); });
  
  browserSync.watch([
    path.join(root, '*/*.html'),
    path.join(root, 'dist/*.js')
  ]).on('change', browserSync.reload);
});

gulp.task('serve', ['watch'], function(){
  browserSync.init({
    server: {
      baseDir: root
    }
  });
});

gulp.task('default', ['serve']);