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
    htmlreplace = require('gulp-html-replace'),
    uglify = require('gulp-uglify-es').default,
    cleancss = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    cleandist = require('del'),
    browserSync = require('browser-sync').create(),
    fontmin = require('gulp-fontmin');
// function
function browsersync() {
    browserSync.init({
            proxy: 'localhost/shop-master/app',
            port: 5000
    })
}

function scssCompile() {
    return src("app/scss/*.scss")
        .pipe(sass())
        .pipe(concat("style.css"))
        .pipe(cleancss({
            keepBreaks: false
        }))
        .pipe(dest("app/css"))
        .pipe(browserSync.stream());
}
function styleBuild() {
    return src('app/*css/**/*.css')
        .pipe(cleancss({
            keepBreaks: false
        }))
        .pipe(rename({
            basename: "bundle",
            extname: '.min.css'
        }))
        .pipe(dest("dist/css"))
}
function scriptBuild() {
    return src(['app/*js/**/*.js'])
        .pipe(uglify())
        .pipe(rename({
            basename: "bundle",
            extname: '.min.js'
        }))
        .pipe(dest('dist'))
}

function del() {
    return cleandist('dist');
}
function image() {
    return src(['app/*img/**/*'])
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
        .pipe(dest('dist/img'))
}

function watching() {
    watch("app/scss/**/*", scssCompile);
    watch("app/**/*").on('change', browserSync.reload);
}
function html(){
    return src("app/index.html")
    .pipe(htmlreplace({
        js: 'js/bundle.min.js',
        css: "css/bundle.min.css"
    }))
    .pipe(dest("dist/"))
}
function build() {
    return src(['app/*.php', 'app/*.txt', 'app/*.xml',"app/*conf**/*"])
        .pipe(dest('dist'))
}
function font(){
    return src('app/*font/**/*')
    .pipe(fontmin())
    .pipe(dest("dist/font"))
}
exports.default = parallel(watching, scssCompile, browsersync);
exports.build = series(del, font, image, scriptBuild, styleBuild, html, build);
