"use strict";
var Splitter = require('st8less');
var through = require('through2');
var path = require('path');
var gutil = require('gulp-util');
var merge = require('merge');

function extractViews(opts) {
    opts = merge({
        dest: "",
        scriptName: "st8less.js",
        split: module.exports.Mithril,
        inject: true
    }, opts);
    opts = opts || {};
    opts.dest = path.join(opts.dest, opts.scriptName);

    var splitterOptions = opts.split(opts), splitter = new Splitter(splitterOptions), firstFileInjected = !opts.inject;

    function injectFirstFile(file, enc) {
        if (!firstFileInjected) {
            var webPath = opts.dest.split(path.sep).join("/"), oldContents = file.contents.toString(enc);
            //inspired by http://stackoverflow.com/questions/3248384/document-createelementscript-synchronously
            file.contents = new Buffer([
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
                oldContents
            ].join("\n"));
            firstFileInjected = true;
        }

    }


    function extractFromFile(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            throw gutil.PluginError("[gulp-split] Does not support streams");
        }
        var src = file.contents.toString(enc);
        splitter.parse(src, function (err, dst) {
            if (err) {
                return cb(err);
            }
            file.contents = new Buffer(dst);
            injectFirstFile(file, enc);
            cb(null, file);
        });


    }
    return through.obj(extractFromFile, function (cb) {
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
    });
}

module.exports = extractViews;
module.exports.Mithril = require('./mithril.extract');