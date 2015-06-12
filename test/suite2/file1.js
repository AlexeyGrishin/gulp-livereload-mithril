var Button = require('./file2');


var Page = {
    view: function () {
        return m("ul", [
            m.component(Button, "add"),
            m.component(Button, "remove")
        ]);
    }
};