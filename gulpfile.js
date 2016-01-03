var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    mainBowerFiles = require('main-bower-files');

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
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
    gulp.watch(['./src/*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);
