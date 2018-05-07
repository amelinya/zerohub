const gulp = require('gulp')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')
const install = require('gulp-install')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
const browserify = require('browserify')
const exorcist = require('exorcist')
const sorcery = require('sorcery')
const del = require('del')
const {exec} = require('pkg')

const chdir = (directory) => {
  return (done) => {
    process.chdir(directory)
    done()
  }
}

gulp.task('current:dependencies', () => {
  return gulp.src(['./package.json'])
        .pipe(install())
})

gulp.task('webclient:transpile', () => {
  return gulp.src(['./src/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(babel({
          plugins: ['react-require'],
          presets: ['env']
        }))
        .pipe(sourcemaps.write('.', {sourceRoot: process.cwd()}))
        .pipe(gulp.dest('./build/transpile/'))
})

gulp.task('webclient:bundle', () => {
  var b = browserify({
    entries: './build/transpile/app.js',
    debug: true
  })

  return b.bundle()
        .pipe(exorcist('./build/bundle/app.js.map'))
        .pipe(source('app.js'))
        .pipe(buffer())
        .pipe(gulp.dest('./build/bundle/'))
})

gulp.task('webclient:uglify', () => {
  return gulp.src('./build/bundle/app.js')
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {sourceRoot: process.cwd()}))
        .pipe(gulp.dest('./build/uglify'))
})

gulp.task('webclient:tracesources', () => {
  var chain = sorcery.loadSync('./build/uglify/app.js')
  chain.apply()
  return chain.write('./build/staging/app.js')
})

gulp.task('webclient:copyassets', () => {
  return gulp.src(['!./src/**/*.js', './src/**/*'])
        .pipe(gulp.dest('./build/staging/'))
})

gulp.task('webclient:copy', () => {
  return gulp.src('./build/staging/*')
        .pipe(gulp.dest('../staging/webclient/'))
})

gulp.task('webclient:clean', () => {
  return del(['./build', './node_modules', './package-lock.json'])
})

gulp.task('webclient:stage',
          gulp.series(
            chdir('./webclient'),
            'current:dependencies',
            'webclient:transpile',
            'webclient:bundle',
            'webclient:uglify',
            'webclient:tracesources',
            'webclient:copyassets',
            'webclient:copy',
            'webclient:clean',
            chdir('..')
          )
        )

/** SERVER **/

gulp.task('server:stage', () => {
  return gulp.src('./server/**/*')
        .pipe(gulp.dest('./staging'))
})

/** APP **/

gulp.task('app:package', () => {
  return exec(['./package.json', '--target', 'node8-linux-armv7'])
})

gulp.task('app:build',
          gulp.series(
            chdir('./staging'),
            'current:dependencies',
            'app:package',
            chdir('..')
          )
        )

gulp.task('make', gulp.series('webclient:stage', 'server:stage', 'app:build'))
