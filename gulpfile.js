const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
const browserify = require('browserify')
const exorcist = require('exorcist')
const sorcery = require('sorcery')
const del = require('del')

gulp.task('clean', () => {
  return del(['./build/**/*'])
})

/** CLIENT **/

gulp.task('client:transpile', () => {
  return gulp.src(['./src/client/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
          plugins: ['react-require'],
          presets: ['env']
        }))
        .pipe(sourcemaps.write('.', {sourceRoot: __dirname}))
        .pipe(gulp.dest('./build/client/transpile/'))
})

gulp.task('client:bundle', () => {
  var b = browserify({
    entries: './build/client/transpile/app.js',
    debug: true
  })

  return b.bundle()
        .pipe(exorcist('./build/client/bundle/app.js.map'))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build/client/bundle/'))
})

gulp.task('client:uglify', () => {
  return gulp.src('./build/client/bundle/app.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {sourceRoot: __dirname}))
        .pipe(gulp.dest('./build/client/uglify'))
})

gulp.task('client:tracesources', () => {
  var chain = sorcery.loadSync('./build/client/uglify/app.js')
  chain.apply()
  return chain.write('./build/client/resolved/app.js')
})

gulp.task('client:copyassets', () => {
  return gulp.src(['!./src/client/**/*.js', './src/client/**/*'])
        .pipe(gulp.dest('./build/staging/client/'))
})

gulp.task('client:build',
          gulp.series(
            'client:transpile',
            'client:bundle',
            'client:uglify',
            'client:tracesources',
            'client:copyassets',
            () => {
              return gulp.src('./build/client/resolved/*')
                    .pipe(gulp.dest('./build/staging/client/'))
            }
          )
        )

/** SERVER **/

gulp.task('server:transpile', () => {
  return gulp.src(['./src/server/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
          presets: ['env']
        }))
        .pipe(sourcemaps.write('.', {sourceRoot: __dirname}))
        .pipe(gulp.dest('./build/server/transpile/'))
})

gulp.task('server:build',
          gulp.series(
            'server:transpile',
            () => {
              return gulp.src('./build/server/transpile/*')
                    .pipe(gulp.dest('./build/staging/server/'))
            }
          )
        )

gulp.task('default', gulp.series('clean', gulp.parallel('client:build', 'server:build')))
