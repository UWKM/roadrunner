var Helpers = (function(){

    var justFunc = function(func) {
        if(typeof func === 'undefined') {
            return function(){};
        } else {
            return func;
        }
    };

    var capitalize = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    var isArray = function(obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
    };

    var clone = function(obj) {
        if(isArray(obj)) {
            return obj.slice(0);
        } else {
            return jQuery.extend(true, {}, obj);
        }
    };

    var has = function(object, key) {
        return object ? hasOwnProperty.call(object, key) : false;
    };

    var cleanPath = function(path){
        var splitted = path.split('-');
        var newPath = [];
        var lastNumber = false;
        for(var i in splitted){
            var part = splitted[i];
            if(!isNaN(part)) {
                if(lastNumber){
                    newPath.push('value');
                }
                newPath.push(part);
                lastNumber = true;
            } else {
                lastNumber = false;
                newPath.push(part);
            }
        }
        return newPath.join('-');
    };

    // Receive a block that has no name and try to make a pretty name for it
    // (or return an empty name when that doesn't work it)
    // FIXME: this function should actually not really be necessary
    var resolveName = function(block){
        if(block.type == 'ProductChooserBlock'){
            return 'Product id';
        }
        if(block.type == 'ImageChooserBlock'){
            return 'Afbeelding';
        }
        return '';
    };

    return {
        justFunc: justFunc,
        capitalize: capitalize,
        clone: clone,
        isArray: isArray,
        has: has,
        cleanPath: cleanPath,
        resolveName: resolveName,
    };

})();
