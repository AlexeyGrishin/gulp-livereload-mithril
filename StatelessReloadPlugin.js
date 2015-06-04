"use strict";

function St8lessPlugin(window) {
    this.window = window;
}
St8lessPlugin.identifier = "st8less";
St8lessPlugin.version = '1.0';
St8lessPlugin.PATTERN = /st8less\.js/;
St8lessPlugin.prototype = {
    doReloadScript: function (scriptNode) {
        var oldSrcBase = scriptNode.src.split("?")[0],
            parent = scriptNode.parentNode,
            newNode = this.window.document.createElement("script");
        parent.removeChild(scriptNode);
        newNode.src = [oldSrcBase, new Date().getTime()].join('?');
        parent.appendChild(newNode);
    },

    doReload: function (pattern) {
        var scripts = this.window.document.getElementsByTagName("script"), i;
        for (i = 0; i < scripts.length; i++) {
            if (scripts[i].src.match(pattern)) {
                this.doReloadScript(scripts[i]);
            }
        }
    },

    reload: function (path) {
        if (path.match(St8lessPlugin.PATTERN)) {
            this.doReload(St8lessPlugin.PATTERN);
            return true;
        }
    }
};

if (window.LiveReload) {
    window.LiveReload.addPlugin(St8lessPlugin);
} else {
    window.LiveReloadPluginSt8less = St8lessPlugin;
}
