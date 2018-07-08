var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
//var uglify = require('gulp-uglify');
var uglify = require('gulp-uglify-es').default;

var pkg = require('./package.json');
var browserSync = require('browser-sync').create();

gulp.task('html', function() {
    return gulp.src([
            '*.html',
            '*/*.html'
        ])
        .pipe(gulp.dest('./dist/'))
});

gulp.task('lang', function() {
    return gulp.src([
            './lang/*',
        ])
        .pipe(gulp.dest('./dist/lang'))
});

gulp.task('assets', function() {
    gulp.src([
            './images/*',
        ])
        .pipe(gulp.dest('./dist/images'))
    gulp.src([
            './icons/*',
        ])
        .pipe(gulp.dest('./dist/icons'))
});

gulp.task('vendor', function() {

    // Bootstrap
    gulp.src([
            './node_modules/bootstrap/dist/**/*',
        ])
        .pipe(gulp.dest('./dist/vendor/bootstrap'))

    // Bootstrap
    gulp.src([
        './node_modules/autobahn-js-built/autobahn.min.js',
    ])
        .pipe(gulp.dest('./dist/vendor/autobahn-js-built'))
    // Bootstrap
    gulp.src([
        './node_modules/angular-wamp/release/angular-wamp.min.js',
    ])
        .pipe(gulp.dest('./dist/vendor/angular-wamp'))
    // AngularJS
    gulp.src([
            './node_modules/angular/angular.min.js'
        ])
        .pipe(gulp.dest('./dist/vendor/angular'))
    gulp.src([
        './node_modules/jquery/dist/jquery.min.js'
    ])
        .pipe(gulp.dest('./dist/vendor/jquery'))
});

// Compile SCSS
gulp.task('css:compile', function() {
    return gulp.src('./scss/**/*.scss')
        .pipe(sass.sync({
            outputStyle: 'expanded'
        }).on('error', sass.logError))
        .pipe(gulp.dest('./dist/css'))
});

// Minify CSS
gulp.task('css:minify', ['css:compile'], function() {
    return gulp.src([
            './dist/css/*.css',
            '!./dist/css/*.min.css'
        ])
        .pipe(cleanCSS())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream());
});

// CSS
gulp.task('css', ['css:compile', 'css:minify']);

// Minify JavaScript
gulp.task('js:minify', function() {
    return gulp.src([
            './js/*.js',
            '!./js/*.min.js'
        ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream());
});

// JS
gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['css', 'lang', 'js', 'vendor', 'html', 'assets']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: "./dist/"
        }
    });
});

// Dev task
gulp.task('dev', ['html', 'lang', 'css', 'js', 'browserSync'], function() {
    gulp.watch('./scss/*.scss', ['css', browserSync.reload]);
    gulp.watch('./js/*.js', ['js', browserSync.reload]);
    gulp.watch('./lang/*.json', ['lang', browserSync.reload]);
    gulp.watch('./**/*.html', ['html', browserSync.reload]);
});
