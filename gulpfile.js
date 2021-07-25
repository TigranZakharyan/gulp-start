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
    fontmin = require('gulp-fontmin'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger')

var path = {
    dist: {
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: {
        html: 'src/*.html',
        js: ['src/js/*.js',"src/js/*.json"],
        style: 'src/style/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    watch: {
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/style/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './dist'
};

const browsersync = () => {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    })
}

const style = () => {
    return src(path.src.style)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(concat("bundle.min.css"))
        .pipe(cleancss({
            keepBreaks: false
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(path.dist.css))
        .pipe(browserSync.stream());
}

const script = () => {
    return src(path.src.js)
        .pipe(rigger())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(rename({
            basename: "bundle",
            extname: '.min.js'
        }))
        .pipe(sourcemaps.write())
        .pipe(dest(path.dist.js))
        .pipe(browserSync.stream());
}
const image = () => {
    return src(path.src.img)
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
        .pipe(dest(path.dist.img))
        .pipe(browserSync.stream());
}
function font(){
    return src(path.src.fonts)
    .pipe(fontmin())
    .pipe(dest(path.dist.fonts))
}


const html = () => {
    return src(path.src.html)
    .pipe(htmlreplace({
        js: 'js/bundle.min.js',
        css: "css/bundle.min.css"
    }))
    .pipe(dest(path.dist.html))
    .pipe(browserSync.stream());

}


const del = () => {
    return cleandist(path.clean);
}

const watching = () => {
    watch(path.watch.html, html);
    watch(path.watch.js, script);
    watch(path.watch.style, style);
    watch(path.watch.img, image);
    watch(path.watch.fonts, font);
}
const build = series(del, html, script, style, image, font);
exports.default = series(build, parallel(browsersync, watching));
