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
	'react-dom',
	'react-router',
	'underscore'
];

// 合并所有的JS文件
gulp.task('vender', function () {
	return gulp.src([
			'bower_components/jquery/dist/jquery',
			'bower_components/bootstrap/dist/bootstrap.js',
			'bower_components/magnific-popup/dist/jquery.magnific-popup.js',
			'bower_components/toastr.js'
		]).pipe(concat('vender.js'))
		.pipe(gulpif(production, uglify({ mangle: false })))
		.pipe(gulp.dest('public/js'));
});

// 因为性能原因，我们将NPM模块和前端模块分开编译和打包，因此每次重新编译将会快个几百毫秒
gulp.task('browserify-vender', function () {
	return browserify()
		.require(dependencies)
		.bundle()
		.pipe(source('vender.bundle.js'))
		.pipe(gulpif(production, streamify(uglify({ mangle: false }))))
		.pipe(gulp.dest('public/js'));
});

// 仅将app文件编译并打包，不包括其它模块和库
gulp.task('browserify', ['browserify-vender'], function () {
	return browserify('app/main.js')
		.external(dependencies)
		.transform(babelify, {presets: ["es2015", "react"]})
		.bundle()
		.pipe(source('bundle.js'))
		.pipe(gulpif(production, streamify(uglify({ mangle: false }))))
		.pipe(gulp.dest('public/js'));

});

// 包括上面的功能，并且监听文件改变，然后重新编译打包app文件
gulp.task('browserify-watch', ['browserify-vender'], function () {
	var bundler = watchify(browserify('app/main.js', watchify.args));

	console.log(watchify.args, 'jjjjj');
	bundler.external(dependencies);
	bundler.transform(babelify);
	bundler.on('update', rebundle);
	return rebundle();

	function rebundle() {
		var start = Date.now();

		return bundler.bundle()
			.on('error', function (err){
				gutil.log('hello');
				gutil.log(gutil.colors.red(err.toString()));
			})
			.on('end', function () {
				gutil.log(gutil.colors.green('Finished rebundling in', (Date.now - start) + 'ms'));
			})
			.pipe(source('bundle.js'))
			.pipe(gulp.dest('public/js/'));
	}
});

// compile less
gulp.task('styles', function () {
	return gulp.src('app/stylesheets/main.less')
		.pipe(plumber())
		.pipe(less())
		.pipe(autoprefixer())
		.pipe(gulpif(production, cssmin()))
		.pipe(gulp.dest('public/css'));

});

gulp.task('watch', function () {
	gulp.watch('app/stylesheets/**/*.less', ['styles']);
});

gulp.task('default', ['styles', 'vender', 'browserify-watch', 'watch']);
gulp.task('build', ['styles', 'vender', 'browserify']);
