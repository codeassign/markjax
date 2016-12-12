"use strict";

var gulp = require("gulp"),
	uglify = require("gulp-uglify"),
	concat = require("gulp-concat"),
	header = require("gulp-header"),
	buffer = require("vinyl-buffer"),
	pkg = require("./package.json"),
	browserify = require("browserify"),
	source = require("vinyl-source-stream");

var banner = ["/**",
	" * <%= pkg.name %> v<%= pkg.version %>",
	" * Copyright <%= pkg.company %>",
	" * @link <%= pkg.homepage %>",
	" * @license <%= pkg.license %>",
	" */",
	""].join("\n");

gulp.task("browserify", [], function() {
	return browserify("./js/markjax.js", {standalone: "markjax"})
		.bundle()
		.pipe(source("markjax.js"))
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("scripts", ["browserify"], function() {
	var js_files = ["./dist/markjax.js"];
	
	return gulp.src(js_files)
		.pipe(concat("markjax.min.js"))
		//.pipe(uglify())
		.pipe(buffer())
		.pipe(header(banner, {pkg: pkg}))
		.pipe(gulp.dest("./dist/"));
});

gulp.task("default", ["scripts"]);
