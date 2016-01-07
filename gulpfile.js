var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    url = require('url'),
    proxy = require('proxy-middleware'),
    cssBase64 = require('gulp-css-base64');
    mainBowerFiles = require('main-bower-files');

gulp.task('connect', function() {
    connect.server({
        root: 'test',
        livereload: false,
        middleware: function(connect, o) {
            return [(function() {
                var options = url.parse('http://store.steampowered.com/api/appdetails');
                options.route = '/api/appdetails';
                return proxy(options);
            })()];
        }
    });
});

gulp.task('js', function() {
    gulp.src('./src/js/*.js')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('css', function() {
    gulp.src('./src/css/*.css')
        .pipe(cssBase64())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('assets', function() {
    gulp.src(['./src/**/*.json', './src/**/*.png'], { base: 'src'})
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor', function() {
    gulp.src(mainBowerFiles('**/*.js'))
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/css/*.css'], ['css']);
});

gulp.task('default', ['connect', 'watch']);
gulp.task('build', ['vendor', 'js', 'css', 'assets']);
