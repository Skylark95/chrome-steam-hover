var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    url = require('url'),
    proxy = require('proxy-middleware'),
    mainBowerFiles = require('main-bower-files');

gulp.task('connect', function() {
    connect.server({
        root: 'dist',
        livereload: true,
        middleware: function(connect, o) {
            return [(function() {
                var options = url.parse('http://store.steampowered.com/api/appdetails');
                options.route = '/api/appdetails';
                return proxy(options);
            })()];
        }
    });
});

gulp.task('html', function() {
    gulp.src('./src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('js', function() {
    gulp.src('./src/js/*.js')
        .pipe(gulp.dest('dist/js'))
        .pipe(connect.reload());
});

gulp.task('css', function() {
    gulp.src('./src/css/*.css')
        .pipe(gulp.dest('dist/css'))
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
    gulp.watch(['./src/js/*.js'], ['js']);
    gulp.watch(['./src/css/*.css'], ['css']);
});

gulp.task('default', ['connect', 'watch']);
gulp.task('build', ['vendor', 'html', 'js', 'css', 'assets']);
