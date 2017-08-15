var Html = (function(){
    var getHtml = function(file){
        var htmlEntity = new HtmlEntity();
        if(HtmlCache[file]) {
            htmlEntity.init(HtmlCache[file]);
        } else {
            htmlEntity.init('Html for ' + file + ' not found');
        }
        return htmlEntity;
    };

    var getMultipleHtml = function(files) {
        var result = {};

        if(files.length == 0) return {};

        for(var i in files){
            var htmlEntity = getHtml(files[i]);
            result[files[i]] = htmlEntity;
        }

        return result;
    };

    return {
        getHtml: getHtml,
        getMultipleHtml: getMultipleHtml,
    };
})();
