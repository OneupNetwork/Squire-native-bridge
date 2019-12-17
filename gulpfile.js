const gulp = require('gulp');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const cssmin = require('gulp-clean-css');
const jsmin = require('gulp-uglify-es').default;

const distPath = "../SQRichTextEditor/SQRichTextEditor/Assets/Editor";


/*****************************************************
 * remove all files
 *****************************************************/

function clean() {
  return del([distPath], {
    force: true
  })
}

/*****************************************************
 * compress all files
 *****************************************************/

function compressJS() {
  return gulp.src('src/*.js')
    .pipe(jsmin())
    .pipe(gulp.dest(distPath));
} 

function compressCSS() {
  return gulp.src('src/*.css')
    .pipe(cssmin({compatibility: '*'}))
    .pipe(gulp.dest(distPath));
} 

function compressHTML() {
  return gulp.src('src/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest(distPath));
} 

/*****************************************************
 * setup tasks
 *****************************************************/

const build = gulp.series(clean, compressJS, compressCSS, compressHTML);
gulp.task('build', build);


