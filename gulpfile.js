var gulp = require('gulp'),
  path = require('path'),
  ngc = require('@angular/compiler-cli/src/main').main,
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

gulp.task('ngc:table-source-copy', function () {
  return ngc({
    project: `${tmpFolder}/tsconfig.es5.json`
  });
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
  return gulp.src([`${buildFolder}/**/*`, `!${buildFolder}/**/*.js`])
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
  return runSequence(
    'clean:table-dist',
    'copy:table-source',
    'sass:table-source-copy',
    'inline-resources:table-source-copy',
    'ngc:table-source-copy',
    'rollup-fesm:table-build',
    'rollup-umd:table-build',
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

gulp.task('ngc:playground', function () {
  return ngc({
    project: `${playgroundSrcFolder}/tsconfig.json`
  })
    .then((exitCode) => {
      if (exitCode === 1) {
        throw new Error('ngc compilation failed');
      }
    });
});

gulp.task('playground:compile', function (done) {
  runSequence(
    'clean:playground',
    'copy:playground',
    'ngc:playground',
    done
  );
});

gulp.task('playground:build', function (done) {
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
})

gulp.task('playground:serve-refresh', function (done) {
  return runSequence(
    'playground:build',
    function () {
      browserSync.reload();
      done();
    }
  );
})

gulp.task('playground', ['playground:serve']);

gulp.task('playground:watch', ['playground'], function () {
  return gulp.watch([`${srcFolder}/**/*`, `${playgroundSrcFolder}/**/*`], ['playground:serve-refresh']);
});
