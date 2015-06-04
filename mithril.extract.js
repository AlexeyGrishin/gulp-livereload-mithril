"use strict";
var fs = require('fs');
var path = require('path');
function readPlugin(opts) {
    var plugin = fs.readFileSync(path.join(__dirname, "StatelessReloadPlugin.js"), {encoding: "utf-8"});
    if (opts && opts.scriptName !== 'st8less.js') {
        plugin += "\nMithPlugin.PATTERN = /" + opts.scriptName.replace(/\./g, "\\.") + "$/;\n";
    }
    return plugin;
}

module.exports = function (opts) {
    return {
        criteria: function (fn) {
            return (fn.name === 'view' || fn.attribute === '__view' || fn.attribute === '__stateless') && fn.attribute !== '__ignore';
        },
        append: readPlugin(opts) + "\n\nm.redraw();"
    };
};