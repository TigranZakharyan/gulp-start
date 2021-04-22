// require
const {
    src,
    dest,
    watch,
    parallel,
    series
} = require('gulp'),
    sass = require('gulp-sass'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    cleancss = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    cleandist = require('del'),
    browserSync = require('browser-sync').create(),
    fontmin = require('gulp-fontmin');
// function
function browsersync() {
    browserSync.init({
            proxy: 'localhost/portfolio-master',
            baseDir: "./app",
            port: 5000
    })
}

function style() {
    return src("app/scss/*.scss")
        .pipe(sass())
        .pipe(cleancss({
            keepBreaks: false
        }))
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(dest("app/css"))
        .pipe(browserSync.stream());
}

function script() {
    return src(['app/js/**/*.js', '!app/js/**/*.min.js'])
        .pipe(uglify())
        .pipe(rename({
            extname: '.min.js'
        }))
        .pipe(dest('app/js'))
        .pipe(browserSync.stream());

}

function del() {
    return cleandist('dist');
}

function image() {
    return src(['app/img/**/*'])
        .pipe(imagemin([
            imagemin.gifsicle({
                interlaced: true
            }),
            imagemin.mozjpeg({
                quality: 75,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{
                        removeViewBox: true
                    },
                    {
                        cleanupIDs: false
                    }
                ]
            })
        ]))
        .pipe(dest('app/img'))
}

function watching() {
    watch('app/scss/**/*.scss', style)
    watch(['app/js/**/*.js', '!app/js/**/*.min.js'], script)
    watch("app/*.html").on('change', browserSync.reload);
    watch("app/*.php").on('change', browserSync.reload);
}

function build() {
    return src(['app/*.html', 'app/*.php', 'app/*.txt', 'app/*.xml', 'app/*img/**/*', 'app/*js/**/*.min.js', 'app/*css/**/*.min.css', 'app/*font/**/*',"app/*conf**/*"])
        .pipe(dest('dist'))
}
function font(){
    return src("app/font/**/*")
    .pipe(fontmin())
    .pipe(dest("app/font"))
}
exports.default = parallel(watching, style, script, browsersync)
exports.build = series(del, font, image, build);
