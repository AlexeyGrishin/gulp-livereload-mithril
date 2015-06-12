var expect = require('expect.js');
var CachedSplitter = require('../CachedSplitter');

describe('cached splitter', function () {

    var OPTS = {globalName: "a", objectName: "b"};
    var FILE1 = "function fn(){'__stateless'; return 1;}";
    var FILE1_CHANGED = "function nf(){'__stateless'; return 1.1;}";
    var FILE2 = "function fn(){'__stateless'; return 2;}";

    function getFunctionNames(splitter) {
        var fns;
        splitter.done(function (ignore, body) {
            fns = Object.keys((new Function("var a = {}; " + body + "; return a;"))().b);
        });
        return fns;

    }
    function noop() {}

    it("shall extract functions as original splitter", function () {
        var splitter = new CachedSplitter(OPTS);
        splitter.parse("file1", FILE1, noop);
        splitter.parse("file2", FILE2, noop);
        expect(getFunctionNames(splitter)).to.eql(["file1_fn0", "file2_fn0"]);
    });

    it("shall update changed file functions", function () {
        var splitter = new CachedSplitter(OPTS);
        splitter.parse("file1", FILE1, noop);
        expect(getFunctionNames(splitter)).to.eql(["file1_fn0"]);
        splitter.parse("file1", FILE1_CHANGED, noop);
        expect(getFunctionNames(splitter)).to.eql(["file1_nf0"]);
    });

    it("keeps non-touched file functions", function () {
        var splitter = new CachedSplitter(OPTS);
        splitter.parse("file1", FILE1, noop);
        splitter.parse("file2", FILE2, noop);
        splitter.parse("file1", FILE1_CHANGED, noop);
        expect(getFunctionNames(splitter)).to.eql(["file1_nf0", "file2_fn0"]);
    });


});