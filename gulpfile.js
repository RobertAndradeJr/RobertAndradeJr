var { src, dest, series, task, watch } = require("gulp");
var sass = require("gulp-sass");
var header = require("gulp-header");
var cleanCSS = require("gulp-clean-css");
var rename = require("gulp-rename");
var uglify = require("gulp-uglify");
var {author, homepage, license,name, title, version } = require("./package.json");
var browserSync = require("browser-sync").create();

const paths = {
  src: {
    scss: "./scss/**/*.scss",
    js: "js/*.js",
    html: "*.html",
    css: ["./css/*.css", "!./css/*.min.css"],
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
    css: "./css",
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
  ` * Start Bootstrap - ${title} v${version}(${homepage})\n`,
  " * Copyright 2013-" + new Date().getFullYear(),
  ` ${author}\n`,
  ` * Licensed under ${license} (https://github.com/BlackrockDigital/${name}/blob/master/LICENSE)\n`,
  " */\n",
  "",
].join("");

// Copy third party libraries from /node_modules into /vendor
const vendor = (done) => {
  // Bootstrap
  src(paths.src.bootStrap).pipe(dest(paths.dest.bootStrap));

  // Devicons
  src(paths.src.devIcons).pipe(dest(paths.dest.devIcons));

  // Font Awesome
  src(paths.src.fontAwesome).pipe(dest(paths.dest.fontAwesome));

  // jQuery
  src(paths.src.jQuery).pipe(dest(paths.dest.jQuery));

  // jQuery Easing
  src(paths.src.easing).pipe(dest(paths.dest.easing));

  // Simple Line Icons
  src(paths.src.simpleLineFonts).pipe(dest(paths.dest.simpleLineFonts));

  src(paths.src.simpleLineCSS).pipe(dest(paths.dest.simpleLineCSS));

  return done();
};

// Compile SCSS
const compileCSS = () =>
  src(paths.src.scss)
    .pipe(
      sass
        .sync({
          outputStyle: "expanded",
        })
        .on("error", sass.logError)
    )
    .pipe(dest(paths.dest.css));

// Minify CSS
const minifyCSS = () =>
  src(paths.src.css)
    .pipe(cleanCSS())
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest(paths.dest.css))
    .pipe(browserSync.stream());

// Minify JavaScript
const minifyJs = () =>
  src(["./js/*.js", "!./js/*.min.js"])
    .pipe(uglify())
    .pipe(header(banner))
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(dest("./js"))
    .pipe(browserSync.stream());

// reload browser when changes detected
const reloadBSync = (done) => {
  browserSync.reload();
  return done();
};

// watch for changes
const gulpWatch = () =>
  watch(
    [paths.src.scss, paths.src.js, paths.src.html],
    series("css", "js", reloadBSync)
  );

// Configure the browserSync task
const bSync = (done) => {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });
  return done();
};

// CSS tasks
task("css:compile", compileCSS);
task("css:minify", series("css:compile", minifyCSS));
task("css", series("css:compile", "css:minify"));

// JS tasks
task("js:minify", minifyJs);
task("js", series("js:minify"));
task("vendor", vendor);

// Default task
task("default", series("css", "js", "vendor"));
task("browserSync", bSync);

// Watch task
task("watch", gulpWatch);

// Dev task
task("dev", series("css", "js", "vendor", "browserSync", "watch"));
