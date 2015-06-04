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
        split: module.exports.Mithril
    }, opts);
    opts = opts || {};
    opts.dest = path.join(opts.dest, opts.scriptName);

    var splitter = new Splitter(opts.split(opts));


    function extractFromFile(file, enc, cb) {
        if (file.isNull()) {
            return cb(null, file);
        }
        if (file.isStream()) {
            throw gutil.PluginError("[gulp-split] Does not support streams");
        }
        var src = file.contents.toString('utf8');
        splitter.parse(src, function (err, dst) {
            if (err) {
                return cb(err);
            }
            file.contents = new Buffer(dst);
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
                contents: new Buffer(body)
            });
            self.push(file);
            cb();
        });
    });
}

module.exports = extractViews;
module.exports.Mithril = require('./mithril.extract');