"use strict";
var CachedSplitter = require('./CachedSplitter');
var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var merge = require('merge');

function extractViews(opts) {
    opts = merge({
        dest: "",
        scriptName: "st8less.js",
        split: module.exports.Mithril,
        inject: true,
        injectPath: ""
    }, opts);
    opts = opts || {};
    opts.dest = path.join(opts.dest, opts.scriptName);

    var splitterOptions = opts.split(opts), extractor, splitter = new CachedSplitter(splitterOptions), firstFileInjected = !opts.inject;

    function injectFirstFile(oldBody) {
        if (!firstFileInjected) {
            var webPath = [opts.injectPath, opts.scriptName].join("/");
            //inspired by http://stackoverflow.com/questions/3248384/document-createelementscript-synchronously
            firstFileInjected = true;
            return [
                "// inject " + webPath + " into page. Inserted automatically by gulp-livereload-plugin",
                "(function loadScriptSynchronously() {",
                "  var path = " + JSON.stringify(webPath) + ";",
                "  document.write('<script src=\"' + path + '\"></script>');",
                "  var req = new XMLHttpRequest();",
                "  req.open('GET', path, false);",
                "  req.send();",
                "  var src = req.responseText",
                "  eval(src)",
                "}.call());",
                "// end of injection",
                oldBody
            ].join("\n");
        }
        return oldBody;

    }

    function extractFromFile(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            throw new gutil.PluginError("[gulp-extract] Does not support streams");
        }
        var src = file.contents.toString(enc);
        splitter.parse(file.path, src, function (err, dst) {
            if (err) {
                return cb(err);
            }
            file.contents = new Buffer(injectFirstFile(dst));
            cb(null, file);
        });
    }

    function pushExtractedFile(cb) {
        var self = this;
        splitter.done(function (err, body) {
            if (err) {
                return cb(err);
            }
            var file = new gutil.File({
                path: opts.dest,
                contents: new Buffer(body + "\n\n" + splitterOptions.append)
            });
            self.push(file);
            cb();
        });

    }
    extractor = through.obj(extractFromFile, pushExtractedFile);
    extractor.browserify = {
        transform: function extractBrowserifyTransformCtor() {
            return function extractBrowserifyTransform(file) {
                return through(function transformBrowserifiedFile(buf, enc, next) {
                    var self = this;
                    splitter.parse(file, buf, function (err, changed) {
                        self.push(changed);
                        next();
                    });
                });
            };
        },
        inject: function extractBrowserifyInjectCtor() {
            return through.obj(function (file, enc, cb) {
                file.contents = new Buffer(injectFirstFile(file.contents.toString(enc)));
                cb(null, file);
            }, function (cb) {
                firstFileInjected = !opts.inject;
                pushExtractedFile.call(this, cb);
            });
        }
    };
    return extractor;
}

module.exports = extractViews;
module.exports.Mithril = require('./mithril.extract');