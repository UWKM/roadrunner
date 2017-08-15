var Routing = (function(){

    var pathToString = function(path){
        return path.join('/');
    };

    var stringToPath = function(str){
        var splitted = str.split('/');
        if(splitted[splitted.length - 1] == '') {
            splitted.pop();
        }
        if(splitted[0] == ''){
            splitted.shift();
        }
        return splitted;
    };

    var getData = function(path, data) {
        if(typeof path === 'string') {
            path = stringToPath(path);
        }
        if(typeof data === 'undefined'){
            data = Globals.tree;
        }
        return _getData(Helpers.clone(path), data); 
    };

    var _getData = function(path, data){
        if(path.length == 0) {
            return data;
        }
        else if(path.length == 1) {
            return data[path];
        } else {
            var next = path.shift();
            return _getData(path, data[next]);
        }
    };

    var getParentData = function(path, data) {
        return _getParentData(Helpers.clone(path), data); 
    };

    var _getParentData = function(path, data) {
        if(path.length == 2) {
            return data;
        } else {
            var next = path.shift();
            return _getParentData(path, data[next]);
        }
    };

    var isNumeric = function(obj) {
        return !isNaN(obj - parseFloat(obj));
    };

    return {
        'pathToString': pathToString,
        'stringToPath': stringToPath,
        'getData': getData,
        'getParentData': getParentData,
    };
})();
