var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    url = require('url'),
    cssBase64 = require('gulp-css-base64');

gulp.task('connect', function() {
    connect.server({
        root: './',
        livereload: true
    });
});

gulp.task('js', function() {
    return gulp.src('./src/js/*.js')
        .pipe(gulp.dest('dist/js'));
});

gulp.task('css', function() {
    return gulp.src('./src/css/*.css')
        .pipe(cssBase64())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('assets', function() {
    return gulp.src(['./src/**/*.json', './src/**/*.png', './src/**/*.html'], { base: 'src'})
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor-js', function() {
    return gulp.src(['bower_components/jquery/dist/jquery.min.js', 'bower_components/tooltipster/js/jquery.tooltipster.min.js'])
        .pipe(concat('vendor.min.js'))
        .pipe(gulp.dest('dist/js'));
});


gulp.task('vendor-css', function() {
    return gulp.src('bower_components/tooltipster/css/tooltipster.css')
        .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/css/*.css'], ['css']);
});

gulp.task('reload', function() {
    gulp.watch(['./test/*.html', './icon/*.html'], {}, function() {
        gulp.src(['./test/*.html', './icon/*.html'])
            .pipe(connect.reload());
    });
});

gulp.task('default', ['connect', 'watch', 'reload']);
gulp.task('vendor', ['vendor-js', 'vendor-css']);
gulp.task('build', ['vendor', 'js', 'css', 'assets']);
