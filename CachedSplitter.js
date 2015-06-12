"use strict";
var Splitter = require('st8less');

function CachedSplitter(options) {
    this.splitterOptions = options;
    this.cache = {};
}

function values(obj) {
    return Object.keys(obj).map(function (k) { return obj[k]; });
}

function toAllowedName(str) {
    return str.replace(/\W+/g, '_');
}

CachedSplitter.prototype = {
    parse: function (id, body, cb) {
        var splitter = new Splitter(this.splitterOptions);
        splitter.parse(body, {prefix: toAllowedName(id) + "_"}, function (err, changed) {
            if (err) {
                return cb(err);
            }
            splitter.done(function (err, res) {
                if (err) {
                    return cb(err);
                }
                this.cache[id] = res;
                cb(null, changed);
            }.bind(this));
        }.bind(this));
    },

    done: function (cb) {
        cb(null, values(this.cache).join("\n\n"));
    }
};

module.exports = CachedSplitter;