var HtmlEntity = function() {
    this.html = null;
};

HtmlEntity.prototype.init = function(html) {
    this.html = html;
    for (var key in TEMPLATE_VARS) {
        if (!TEMPLATE_VARS.hasOwnProperty(key)) continue;
        this.set(key, TEMPLATE_VARS[key]);
    }
};

HtmlEntity.prototype.set = function(key, value) {
    this.html = this.html.replace(new RegExp('{{' + key + '}}', 'g'), value);
    return this;
};
