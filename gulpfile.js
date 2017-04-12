var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var streamify = require('gulp-streamify');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-cssmin');
var less = require('gulp-less');
var concat = require('gulp-concat');
var plumber = require('gulp-plumber');
var source = require('vinyl-source-stream');
var babelify = require('babelify');
var browserify = require('browserify');
var watchify = require('watchify');
var uglify = require('gulp-uglify');

var production = process.env.NODE_ENV === 'production';

var dependencies = [
	'alt',
	'react',
	'react-router',
	'undersource'
];

gulp.task('vendor', function () {
	return gulp.src([
		'bower_components/jquery/dist/jquery.js',
		'bower_components/bootstrap/dist/js/bootstrap.js',
		'bower_components/magnific-popup/dist/jquery.magnific-popup.js',
		'bower_components/toastr/toastr.js'
	]).pipe(concat('vendor.js'))
		.pipe(gulpif(production, uglify({ mangle: false })))
		.pipe(gulp.dest('public/js'));
});

gulp.task('browserify', ['browserify-vendor'], function () {
	return browserify('app/main.js')
	.external(dependencies)
	.transform(babelify)
	.bundle()
	.pipe(source('bundle.js'))
	.pipe(gulpif(production, streamify(uglify({ mangle: false }))))
	.pipe(gulp.dest('public/js'));
});
