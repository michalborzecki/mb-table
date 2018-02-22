var gulp = require('gulp'),
  argv = require('yargs').argv,
  gulpIf = require('gulp-if'),
  path = require('path'),
  merge = require('merge-stream'),
  ts = require('gulp-typescript'),
  sourcemaps = require('gulp-sourcemaps'),
  rollup = require('gulp-rollup'),
  rename = require('gulp-rename'),
  del = require('del'),
  runSequence = require('run-sequence'),
  sass = require('gulp-sass'),
  inlineResources = require('angular-inline-resources'),
  browserSync = require("browser-sync").create();

const rootFolder = path.join(__dirname);
const srcFolder = path.join(rootFolder, 'src');
const tmpFolder = path.join(rootFolder, '.tmp');
const buildFolder = path.join(rootFolder, 'build');
const distFolder = path.join(rootFolder, 'dist');
const playgroundSrcFolder = path.join(rootFolder, 'playground');
const playgroundBuildFolder = path.join(rootFolder, '.playground');

let devMode = argv.dev;

gulp.task('clean:table-dist', function () {
  return del([distFolder + '/**', '!' + distFolder]);
});

gulp.task('copy:table-source', function () {
  return gulp.src([`${srcFolder}/**/*`, `!${srcFolder}/node_modules`])
    .pipe(gulp.dest(tmpFolder));
});

gulp.task('sass:table-source-copy', function () {
  return gulp.src([`${tmpFolder}/**/*.scss`])
    .pipe(sass())
    .pipe(gulp.dest(tmpFolder));
});

gulp.task('inline-resources:table-source-copy', function () {
  return inlineResources(tmpFolder);
});

gulp.task('tsc:table-source-copy', function () {
  const tsProject = ts.createProject(
    `${tmpFolder}/tsconfig.es5.json`,
    devMode ? { module: 'commonjs' } : {}
  );
  const tsResult = tsProject.src()
    .pipe(gulpIf(devMode, sourcemaps.init()))
    .pipe(tsProject());
  return merge(
    tsResult.js
      .pipe(gulpIf(devMode, sourcemaps.write()))
      .pipe(gulp.dest(buildFolder)),
    tsResult.dts.pipe(gulp.dest(buildFolder))
  );
});

gulp.task('rollup-fesm:table-build', function () {
  return gulp.src(`${buildFolder}/**/*.js`)
    .pipe(rollup({
      input: `${buildFolder}/index.js`,
      allowRealFiles: true,
      external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms',
        '@ngui/auto-complete',
        'jquery',
        'rxjs/Rx',
        'element-resize-detector'
      ],
      format: 'es',
      onwarn: function (warning) {
        if (warning.code !== 'THIS_IS_UNDEFINED') {
          console.warn(warning.message)
        }
      }
    }))
    .pipe(gulp.dest(distFolder));
});

gulp.task('rollup-umd:table-build', function () {
  return gulp.src(`${buildFolder}/**/*.js`)
    .pipe(rollup({
      input: `${buildFolder}/index.js`,
      allowRealFiles: true,
      external: [
        '@angular/core',
        '@angular/common',
        '@angular/forms',
        '@ngui/auto-complete',
        'jquery',
        'rxjs/Rx',
        'element-resize-detector'
      ],
      format: 'umd',
      exports: 'named',
      name: 'mb-table',
      globals: {
        typescript: 'ts',
        '@angular/core': 'core',
        '@angular/common': 'common',
        '@angular/forms': 'forms',
        '@ngui/auto-complete': 'autoComplete',
        jquery: '$',
        'element-resize-detector': 'elementResizeDetector',
        'rxjs/Rx': 'Rx'
      },
      onwarn: function (warning) {
        if (warning.code !== 'THIS_IS_UNDEFINED') {
          console.warn(warning.message)
        }
      }
    }))
    .pipe(rename('mb-table.umd.js'))
    .pipe(gulp.dest(distFolder));
});

gulp.task('copy:table-build', function () {
  return gulp.src([`${buildFolder}/**/*`].concat(devMode ? [] : [`!${buildFolder}/**/*.js`]))
    .pipe(gulp.dest(distFolder));
});

gulp.task('copy:table-manifest', function () {
  return gulp.src([`${srcFolder}/package.json`])
    .pipe(gulp.dest(distFolder));
});

gulp.task('copy:table-readme', function () {
  return gulp.src([path.join(rootFolder, 'README.MD')])
    .pipe(gulp.dest(distFolder));
});

gulp.task('clean:table-source-copy', function () {
  return del([tmpFolder]);
});

gulp.task('clean:table-build', function () {
  return del([buildFolder]);
});

gulp.task('compile:table', function (done) {
  const rollup = devMode ? [] : [
    'rollup-fesm:table-build',
    'rollup-umd:table-build',
  ];
  return runSequence(
    'clean:table-dist',
    'copy:table-source',
    'sass:table-source-copy',
    'inline-resources:table-source-copy',
    'tsc:table-source-copy',
    ...rollup,
    'copy:table-build',
    'copy:table-manifest',
    'copy:table-readme',
    'clean:table-build',
    'clean:table-source-copy',
    function (err) {
      if (err) {
        console.log('ERROR:', err.message);
        return del([distFolder, tmpFolder, buildFolder]);
      } else {
        console.log('Compilation finished succesfully');
      }
      done();
    });
});

gulp.task('watch', function () {
  gulp.watch(`${srcFolder}/**/*`, ['compile:table']);
});

gulp.task('clean', ['clean:table-dist', 'clean:table-source-copy', 'clean:table-build']);

gulp.task('build', ['clean', 'compile:table']);

gulp.task('build:watch', ['build', 'watch']);

gulp.task('default', ['build:watch']);

gulp.task('clean:playground', function () {
  return del(playgroundBuildFolder + '/**');
});

gulp.task('copy:playground', function () {
  return gulp.src([
    `${playgroundSrcFolder}/index.html`,
    `${playgroundSrcFolder}/systemjs.config.js`,
  ]).pipe(gulp.dest(playgroundBuildFolder));
});

gulp.task('tsc:playground', function () {
  const tsProject = ts.createProject(`${playgroundSrcFolder}/tsconfig.json`);
  return tsProject
    .src()
    .pipe(sourcemaps.init())
    .pipe(tsProject()).js
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(playgroundBuildFolder));
});

gulp.task('playground:compile', function (done) {
  runSequence(
    'clean:playground',
    'copy:playground',
    'tsc:playground',
    done
  );
});

gulp.task('playground:build', function (done) {
  devMode = true;
  runSequence(
    'compile:table',
    'playground:compile',
    done
  );
});

gulp.task('playground:serve', ['playground:build'], function () {
  browserSync.init({
    server: {
      baseDir: [playgroundBuildFolder],
      routes: {
        '/node_modules': 'node_modules',
        '/dist': 'dist',
      },
    },
  });
});

gulp.task('playground:serve-refresh', function (done) {
  return runSequence(
    'playground:build',
    function () {
      browserSync.reload();
      done();
    }
  );
});

gulp.task('playground', ['playground:serve']);

gulp.task('playground:watch', ['playground'], function () {
  return gulp.watch([`${srcFolder}/**/*`, `${playgroundSrcFolder}/**/*`], ['playground:serve-refresh']);
});
