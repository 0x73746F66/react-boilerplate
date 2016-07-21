'use strict';

import gulp from 'gulp';
import sourcemaps from 'gulp-sourcemaps';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import concat from 'gulp-concat';
import browserify from 'browserify';
import source from 'vinyl-source-stream';
import gutil from 'gulp-util';
import babelify from 'babelify';
import htmlreplace from 'gulp-html-replace';
import $ from 'gulp-load-plugins';
import swPrecache from 'sw-precache';
import browserSync from 'browser-sync';
import gulpIf from 'gulp-if';
import changed from 'gulp-changed';
import runSequence from 'run-sequence';
import image from 'gulp-image';
import del from 'del';

let _clean = false;
let _sync = false;
let _production = false;
let buildScript = 'vendor' + (_production ? '.min' : '') + '.js';
let bundleScript = 'bundle' + (_production ? '.min' : '') + '.js';

const PATH = {
  ENTRY_HTML: 'src/index.html',
  ENTRY_SCRIPT: 'src/app.jsx',
  DIST: 'dist/',
  DIST_IMG: 'dist/textures/',
  DIST_JS: 'dist/js/',
  BUNDLE_JS: 'js/'+bundleScript,
  BUILD_JS: 'js/'+buildScript
};

/*
 * Q. Why not just use webpack? It's wayyy easier
 * A. Correct, it is easier. However, it makes assumptions for you that you cannot manage without some extensive configuration ugliness
 *    Do you recall why we went from Grunt to Gulp? No more configs, we get to code out tasks and control them if and when we need to.
 *    Essentially Gulp need little to no configuration just like Webpack to do a simple src to dist, but if you need to bundle
 *    modules, a, b, c, x, y, z, from multiple src such as node_modules, but not all, then to do that in Webpack is a nightmare.
 *
 * Q. So should i use Webpack or Gulp?
 *
 * A. It depends, if you know that for the life of the project you will strictly only need to do what webpack can be easily configured to do,
 *    i.e. move from src to dist with some loaders, then hell just use webpack. otherwise; if you foresee any specific use case
 *    like generating a service worker, or bundling modules form various npm deps, then gulp alone will make your life easier than trying
 *    to juggle Gulp with browserify and webpack at the same time doing the same things.
 *
 */
gulp.task('default', cb =>
  runSequence(['build'], ['watch'], cb)
);

gulp.task('build', cb =>
  runSequence(['build:js', 'build:app.jsx'], ['build:css', 'build:json', 'build:images', 'build:html'], 'build:service-worker', cb)
);

gulp.task('build:clean', cb =>
  runSequence('clean', ['build:js', 'build:app.jsx'], ['build:css', 'build:json', 'build:images', 'build:html'], 'build:service-worker', cb)
);

gulp.task('watch', cb =>
  runSequence(['browser-sync'], ['watch:app'], cb)
);

gulp.task('clean', ()=>{
  del([PATH.DIST]);
  _clean = true;
});

gulp.task('build:js', ()=>
  gulp.src('src/js/*.js')
    .pipe(gulpIf(!_clean, changed('src/js', {extension: '.js'})))
    .pipe(gulpIf(!_production, sourcemaps.init()))
    .pipe(babel({
        presets: ['es2015', 'es2016', 'stage-0']
    }))
    .pipe(concat(PATH.BUILD_JS))
    .pipe(gulpIf(!_production, sourcemaps.write()))
    .pipe(gulp.dest(PATH.DIST))
    .pipe(gulpIf(_sync, browserSync.reload({stream: true})))
);

gulp.task('build:app.jsx', ()=>{
  // Browserify will bundle all our js files together in to one and will let
  // us use modules in the front end.
  let appBundler = browserify({
    entries: PATH.ENTRY_SCRIPT,
    debug: !_production
  });
  // hey webpack user, want more loaders? we call them transformers! no, not like those transformers..
  // Check it out: https://github.com/substack/node-browserify/wiki/list-of-transforms

  // transform ES6 and JSX to ES5 with babelify
  return appBundler
  .transform("babelify", {presets: ["es2015", "es2016", "stage-0", "react"], sourceMaps: "inline"})
   .bundle()
   .on('error', gutil.log)
   .pipe(source(bundleScript))
   .pipe(gulp.dest(PATH.DIST_JS))
   .pipe(gulpIf(_sync, browserSync.reload({stream: true})));
});

gulp.task('build:json', ()=>
  gulp.src('src/**/*.json')
     .pipe(gulpIf(!_clean, changed('src', {extension: '.json'})))
     .pipe(gulp.dest(PATH.DIST))
     .pipe(gulpIf(_sync, browserSync.reload({stream: true})))
);

gulp.task('build:html', ()=>
  gulp.src(PATH.ENTRY_HTML)
     .pipe(gulpIf(!_clean, changed('src', {extension: '.html'})))
     .pipe(htmlreplace({
        'jsx': PATH.BUNDLE_JS,
        'js': PATH.BUILD_JS
      }))
     .pipe(gulp.dest(PATH.DIST))
     .pipe(gulpIf(_sync, browserSync.reload({stream: true})))
);

gulp.task('build:css', ()=>
  gulp.src('src/**/*.scss')
    .pipe(gulpIf(!_clean, changed('src/css', {extension: '.scss'})))
    .pipe(gulpIf(_production, sourcemaps.init()))
    .pipe(sass({outputStyle: 'compressed'})
    .on('error', sass.logError))
    .pipe(gulpIf(_production, sourcemaps.write()))
    .pipe(gulp.dest(PATH.DIST))
    .pipe(gulpIf(_sync, browserSync.reload({stream: true})))
);

gulp.task('build:images', () =>
  gulp.src('src/textures/*')
    .pipe(gulpIf(!_clean, changed('src/textures')))
    .pipe(image({
      pngquant: true,
      optipng: false,
      zopflipng: true,
      jpegRecompress: false,
      jpegoptim: true,
      mozjpeg: true,
      gifsicle: true,
      svgo: true
    }))
    .pipe(gulp.dest(PATH.DIST_IMG))
);

gulp.task('watch:app', ()=>{
  gulp.watch(['./src/**/*.json'], ['build:json', 'build:service-worker']);
  gulp.watch(['./src/**/*.scss'], ['build:css', 'build:service-worker']);
  gulp.watch(['./src/js/*.js'], ['build:js', 'build:service-worker']);
  gulp.watch(['./src/*.jsx'], ['build:app.jsx', 'build:service-worker']);
  gulp.watch(['./src/**/*.html'], cb =>
    runSequence(['build:html', 'build:service-worker'], cb)
  );
});


gulp.task('browser-sync', ()=>{
  _sync = true;
  if (!_production) {
    browserSync.create();
    browserSync.init({
      proxy: {
        target: '127.0.0.1:8080'
      },
      logLevel: 'debug',
      logConnections: true
    });
  }
});

gulp.task('build:service-worker', callback => writeServiceWorkerFile({rootDir: 'dist', handleFetch: false, verbose: true, callback: callback}) );

function writeServiceWorkerFile(parameters = {}) {
  let rootDir     = parameters.rootDir;
  let handleFetch = parameters.handleFetch||true;
  let verbose     = parameters.verbose||false;
  let callback    = parameters.callback;
  let config      = {
    // If handleFetch is false (i.e. because this is called from generate-service-worker-dev), then
    // the service worker will precache resources but won't actually serve them.
    // This allows you to test precaching behavior without worry about the cache preventing your
    // local changes from being picked up during the development cycle.
    handleFetch: handleFetch,

    logger: $().util.log,
    // Brute force server worker routing:
    // Tell the service worker to use /shell for all navigation requests.
    // E.g. A request for /user/12345 will be fulfilled with /shell
    navigateFallback: '/shell',

    // Various runtime caching strategies: sets up sw-toolbox handlers.
    runtimeCaching: [{
      // See https://github.com/GoogleChrome/sw-toolbox#methods
      urlPattern: /index\.html/,
      handler: 'cacheFirst',
      // See https://github.com/GoogleChrome/sw-toolbox#options
      options: {
        cache: {
          maxEntries: 1,
          name: 'runtime-cache'
        }
      }
    }, {
      urlPattern: /\.js/,
      handler: 'cacheFirst',
      options: {
        cache: {
          maxEntries: 20,
          name: 'runtime-cache'
        }
      }
    }, {
      urlPattern: /\.css/,
      handler: 'cacheFirst',
      options: {
        cache: {
          maxEntries: 20,
          name: 'runtime-cache'
        }
      }
    }, {
      urlPattern: /textures/,
      handler: 'cacheFirst',
      options: {
        cache: {
          name: 'image-cache',
          // Use sw-toolbox's LRU expiration.
          maxEntries: 50
        }
      }
    }, {
      // Use a network first strategy for everything else.
      default: 'networkFirst'
    }],
    // Ensure all our static, local assets are cached.
    staticFileGlobs: [
      rootDir + '/css/**.css',
      rootDir + '/textures/**.*',
      rootDir + '/js/**.js',
      rootDir + '/**.json',
      rootDir + '/**.html'
    ],
    stripPrefix: rootDir + '/',
    // verbose defaults to false, but for the purposes of this demo, log more.
    verbose: verbose
  };

  swPrecache.write(rootDir+'/service-worker'+(_production?'':'-dev')+'.js', config, callback);
}
