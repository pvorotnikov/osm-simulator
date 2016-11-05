'use strict';

// Gulp Dependencies
const path = require('path');
const argv = require('yargs').argv;
const gulp = require('gulp');
const gulpif = require('gulp-if');
const gutil = require('gulp-util');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const clean = require('gulp-clean');
const minify = require('gulp-clean-css');
const pug = require('gulp-pug');
const babel = require('gulp-babel');

const BUILD_PATH = './www'

function swallowError (error) {
  gutil.log(error.toString());
  this.emit('end');
}

/**
 * Clean the build directory
 * @param  {[type]} 'clean-build' [description]
 * @param  {[type]} (             [description]
 * @return {[type]}               [description]
 */
gulp.task('clean-build', () => {

  return gulp.src(BUILD_PATH)
    .pipe(clean({force: true}));
});

/**
 * Bundle External Dependencies
 * @param  {[type]} 'bundle-external' [description]
 * @param  {[type]} (                 [description]
 * @return {[type]}                   [description]
 */
gulp.task('bundle-external', () => {

  // react
  gulp.src('node_modules/react/dist/react-with-addons.js')
    .pipe(rename('lib/react/react.js'))
    .pipe(gulp.dest(BUILD_PATH));
  gulp.src('node_modules/react-dom/dist/react-dom.js')
    .pipe(rename('lib/react/react-dom.js'))
    .pipe(gulp.dest(BUILD_PATH));

  // require.js
  gulp.src('node_modules/requirejs/require.js')
    .pipe(gulp.dest(`${BUILD_PATH}/lib/require/`));

  // classnames
  gulp.src('node_modules/classnames/index.js')
    .pipe(rename('lib/classnames/classnames.js'))
    .pipe(gulp.dest(BUILD_PATH));

  // moment
  gulp.src('node_modules/moment/min/moment-with-locales.min.js')
    .pipe(rename('lib/moment/moment.js'))
    .pipe(gulp.dest(BUILD_PATH));

  // font awesome
  gulp.src('node_modules/font-awesome/css/font-awesome.css')
    .pipe(gulp.dest(`${BUILD_PATH}/lib/font-awesome/css/`));
  gulp.src('node_modules/font-awesome/fonts/*.*')
    .pipe(gulp.dest(`${BUILD_PATH}/lib/font-awesome/fonts/`));

  // jquery
  gulp.src('node_modules/jquery/dist/jquery.min.js')
    .pipe(rename('lib/jquery/jquery.js'))
    .pipe(gulp.dest(BUILD_PATH));

  // onsenui
  gulp.src('node_modules/onsenui/**')
    .pipe(gulp.dest(`${BUILD_PATH}/lib/onsenui`));
  gulp.src('node_modules/react-onsenui/dist/**')
    .pipe(gulp.dest(`${BUILD_PATH}/lib/react-onsenui`));

});


/**
 * Regenerate Index
 * @param  {[type]} 'build-index' [description]
 * @param  {[type]} (             [description]
 * @return {[type]}               [description]
 */
gulp.task('build-index', () => {

  return gulp.src('src/*.pug')
    .pipe(pug({
      pretty: true,
    }))
    .on('error', swallowError)
    .pipe(gulp.dest(BUILD_PATH));
});


/**
 * Build js
 * @param  {[type]} 'build-js' [description]
 * @param  {[type]} (          [description]
 * @return {[type]}            [description]
 */
gulp.task('build-js', () => {

  let presets = ['react'];

  gulp.src(['src/**/*.js', 'src/**/*.jsx'])
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: presets
    }))
    .on('error', swallowError)
    .pipe(sourcemaps.write('../www/'))
    .pipe(gulp.dest(`${BUILD_PATH}`));
});

/**
 * Build less
 * @param  {[type]} 'build-less' [description]
 * @param  {[type]} (            [description]
 * @return {[type]}              [description]
 */
gulp.task('build-less', () => {

  gulp.src('src/css/styles.less')
    .pipe(less())
    .on('error', swallowError)
    .pipe(rename('css/style.css'))
    // .pipe(minify({compatibility: 'ie8'}))
    .pipe(gulp.dest(BUILD_PATH));
});

/**
 * Bundle images
 * @param  {[type]} 'bundle-images' [description]
 * @param  {[type]} (               [description]
 * @return {[type]}                 [description]
 */
gulp.task('bundle-images', () => {

  gulp.src(['src/img/**/*.png', 'src/img/**/*.jpg', 'src/img/**/*.svg'])
    .pipe(gulp.dest(`${BUILD_PATH}/img`));
});


/**
 * Watch
 * @param  {[type]}
 * @return {[type]}   [description]
 */
gulp.task('watch', () => {
  gutil.log('Watching for changes...');
  gulp.watch(['src/*.pug'], ['build-index']);
  gulp.watch(['src/**/*.js', 'src/**/*.jsx'], ['build-js']);
  gulp.watch(['src/css/**/*.less'], ['build-less']);
  gulp.watch(['src/img/**/*.png', 'src/img/**/*.jpg', 'src/img/**/*.svg'], ['bundle-images']);
});


// ======================
// MAIN TASK
// ======================

gulp.task('build', (() => {

  let tasks = [
    'bundle-external',
    'bundle-images',
    'build-index',
    'build-js',
    'build-less',
  ];

  if (argv.watch) tasks.push('watch');

  return tasks;
})());

gulp.task('clean', [
  'clean-build'
]);
