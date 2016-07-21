var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var gutil = require('gulp-util');
var replace = require('gulp-replace');

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

gulp.task('watch', ['build-cordova'], function(){
  browserSync.watch([
    path.join(root, 'src/**/*.js'),
    path.join(root, 'lib/**/*.js')
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
    },
    ghostMode: false,
  });
});

gulp.task('build-cordova', ['babelify'], function(){
  gulp.src(['./index.html'])
    .pipe(replace('node_modules/three/build', 'lib'))
    .pipe(gulp.dest('./cordova/www'));
  gulp.src(['./node_modules/three/build/three.js']).pipe(gulp.dest('./cordova/www/lib'));
  gulp.src(['./lib/**/*']).pipe(gulp.dest('./cordova/www/lib/'));
  gulp.src(['./res/**/*']).pipe(gulp.dest('./cordova/www/res'));
  gulp.src(['./dist/**/*']).pipe(gulp.dest('./cordova/www/dist'));
});

gulp.task('default', ['serve']);