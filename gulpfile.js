var gulp = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var pkg = require("./package.json");
const { easing } = require("jquery");
var browserSync = require("browser-sync").create();

const paths = {
  src: {
    scss: "scss/*.scss",
    js: "js/*.js",
    html: "*.html",
    bootStrap: [
      "./node_modules/bootstrap/dist/**/*",
      "!./node_modules/bootstrap/dist/css/bootstrap-grid*",
      "!./node_modules/bootstrap/dist/css/bootstrap-reboot*",
    ],
    devIcons: [
      "./node_modules/devicons/**/*",
      "!./node_modules/devicons/*.json",
      "!./node_modules/devicons/*.md",
      "!./node_modules/devicons/!PNG",
      "!./node_modules/devicons/!PNG/**/*",
      "!./node_modules/devicons/!SVG",
      "!./node_modules/devicons/!SVG/**/*",
    ],
    fontAwesome: [
      "./node_modules/font-awesome/**/*",
      "!./node_modules/font-awesome/{less,less/*}",
      "!./node_modules/font-awesome/{scss,scss/*}",
      "!./node_modules/font-awesome/.*",
      "!./node_modules/font-awesome/*.{txt,json,md}",
    ],
    jQuery: [
      "./node_modules/jquery/dist/*",
      "!./node_modules/jquery/dist/core.js",
    ],
    easing: ["./node_modules/jquery.easing/*.js"],
    simpleLineFonts: ["./node_modules/simple-line-icons/fonts/**"],
    simpleLineCSS: ["./node_modules/simple-line-icons/css/**"],
  },
  dest: {
    bootStrap: "./vendor/bootstrap",
    devIcons: "./vendor/devicons",
    fontAwesome: "./vendor/font-awesome",
    jQuery: "./vendor/jquery",
    easing: "./vendor/jquery-easing",
    simpleLineFonts: "./vendor/simple-line-icons/fonts",
    simpleLineCSS: "./vendor/simple-line-icons/css",
  },
};

// Set the banner content
var banner = [
  "/*!\n",
  " * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n",
  " * Copyright 2013-" + new Date().getFullYear(),
  " <%= pkg.author %>\n",
  " * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n",
  " */\n",
  "",
].join("");

const vendor = (done) => {
  // Bootstrap
  gulp.src(paths.src.bootStrap).pipe(gulp.dest(paths.dest.bootStrap));

  // Devicons
  gulp.src(paths.src.devIcons).pipe(gulp.dest(paths.dest.devIcons));

  // Font Awesome
  gulp.src(paths.src.fontAwesome).pipe(gulp.dest(paths.dest.fontAwesome));

  // jQuery
  gulp.src(paths.src.jQuery).pipe(gulp.dest(paths.dest.jQuery));

  // jQuery Easing
  gulp.src(paths.src.easing).pipe(gulp.dest(paths.dest.easing));

  // Simple Line Icons
  gulp
    .src(paths.src.simpleLineFonts)
    .pipe(gulp.dest(paths.dest.simpleLineFonts));

  gulp.src(paths.src.simpleLineCSS).pipe(gulp.dest(paths.dest.simpleLineCSS));

  return done();
};

// Copy third party libraries from /node_modules into /vendor
gulp.task("vendor", vendor);

// Compile SCSS
gulp.task("css:compile", function () {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(
      sass
        .sync({
          outputStyle: "expanded",
        })
        .on("error", sass.logError)
    )
    .pipe(gulp.dest("./css"));
});

// Minify CSS
gulp.task(
  "css:minify",
  gulp.series("css:compile", function () {
    return gulp
      .src(["./css/*.css", "!./css/*.min.css"])
      .pipe(cleanCSS())
      .pipe(
        rename({
          suffix: ".min",
        })
      )
      .pipe(gulp.dest("./css"))
      .pipe(browserSync.stream());
  })
);

// CSS
gulp.task("css", gulp.series("css:compile", "css:minify"));

// Minify JavaScript
gulp.task("js:minify", function () {
  return gulp
    .src(["./js/*.js", "!./js/*.min.js"])
    .pipe(uglify())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(gulp.dest("./js"))
    .pipe(browserSync.stream());
});

// JS
gulp.task("js", gulp.series("js:minify"));

// Default task
gulp.task("default", gulp.series("css", "js", "vendor"));

const bSync = (done) => {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  return done();
};

// Configure the browserSync task
gulp.task("browserSync", bSync);

const reloadBSync = (done) => {
  browserSync.reload();
  return done();
};

const gulpWatch = () =>
  gulp.watch(
    [paths.src.scss, paths.src.js, paths.src.html],
    gulp.series("css", "js", reloadBSync)
  );

gulp.task("watch", gulpWatch);

// Dev task
gulp.task("dev", gulp.series("css", "js", "vendor", "browserSync", "watch"));
