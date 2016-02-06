var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    url = require('url'),
    cssBase64 = require('gulp-css-base64'),
    cssnano = require('gulp-cssnano');

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
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css'));
});

gulp.task('assets', function() {
    return gulp.src(['./src/**/*.json', './src/**/*.png', './src/**/*.html'], { base: 'src'})
        .pipe(gulp.dest('dist'));
});

gulp.task('vendor-js', function() {
    return gulp.src([
            'bower_components/jquery/dist/jquery.js',
            'bower_components/tooltipster/js/jquery.tooltipster.js',
            'bower_components/mutation-summary/src/mutation-summary.js'
        ])
        .pipe(concat('vendor.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});


gulp.task('vendor-css', function() {
    return gulp.src('bower_components/tooltipster/css/tooltipster.css')
        .pipe(concat('vendor.min.css'))
        .pipe(cssnano({
            zindex: false
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('watch', function() {
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/css/*.css'], ['css']);
    gulp.watch(['./src/**/*.json', './src/**/*.png', './src/**/*.html'], ['assets']);
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
