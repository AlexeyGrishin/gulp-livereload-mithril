var Page = {
    controller: function () {
        this.count = 5.5;
    },

    view: function (c) {
        return m('h3', ['count is', Math.ceil(c.count)]);
    }
};