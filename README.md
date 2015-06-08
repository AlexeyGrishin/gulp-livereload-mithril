[![Coverage Status](https://coveralls.io/repos/AlexeyGrishin/gulp-livereload-mithril/badge.svg?branch=master)](https://coveralls.io/r/AlexeyGrishin/gulp-livereload-mithril?branch=master)
[![Code Climate](https://codeclimate.com/github/AlexeyGrishin/gulp-livereload-mithril/badges/gpa.svg)](https://codeclimate.com/github/AlexeyGrishin/gulp-livereload-mithril)

# What is this

This plugin allows to re-arrange js code to move all mithril views into separate js file and reload it softly with
LiveReload, so you may make changed in code and see result without page reload in browser.

# Demo

See [here](https://github.com/AlexeyGrishin/live-reload-mithril-demo)

# Install

```
npm install --save-dev gulp-livereload-mithril
```

and in 99% cases (and for demo above) you also will need:

```
npm install --save-dev gulp-changed gulp-live-server
```

# How to use

Just include it in pipe *after* all processing of js code but *before* saving it to destination folder and notifying live reload server.

```javascript

var extract = require('gulp-livereload-mithril');

//...

gulp.task('compile', function () {
    //-------------------------------------------------// So here we
    gulp.src(SRC)                                      // 1) get coffeescripts
        .pipe(coffee())                                // 2) compile to javascript
        .pipe(extract())                               // 3) extract mithril views into separate file named `st8less.js`
        .pipe(changed(DEST, {                          // 4) ignore js files which contents not changed
            hasChanged: changed.compareSha1Digest      //
        }))                                            //
        .pipe(gulp.dest(DEST))                         // 5) copy changed to public
        .pipe(server ? server.notify() : gutil.noop());// 6) notify server about changed files only.
});
```

If you don't know how to work with LiveReload please refer to documentation for [gulp-live-server plugin](https://github.com/gimm/gulp-live-server) and for [LiveReload](http://livereload.com/) itself.

You do not need to include extracted file manually by default - corresponding `<script>` will be injected into one of your original js files.

# Configuration

`extract()` functions accepts options object with following properties

* `dest` - path to store the js file with extracted view functions. Note that path is relative to the `gulp.dest` folder you'll specify. Default is empty (so new file will be placed into the root of dest folder)
* `scriptName` - name of the script file. Default is `st8less.js`
* `inject` - if true then script with extracted functions is injected automatically (via `document.write` in one of the original scripts). If you'd like to include it to page manually set it to false.
* `injectPath` - relative path to script for injection. Has meaning if `inject` is true then script with path
* `split` - object that declares which functions shall be extracted. See `mithril.extract.js` in sources for example. Shall have 2 properties:
  * `append` - string to write into extracted file
  * `criteria` - function that will be called for each met function and shall return true if it shall be extracted. Accepts 1 object parameter with properties:
    * `name` - name of function, or name of variable/property name (in case of `var a = function(){}` name will be `a`)
    * `attribute` - first string expression in function body, for example in `function view() { "__stateless"; return 5;}` the attribute will be `__stateless`)
    * `paramNames` - list of function argument names

