var Content = (function(){

    // Takes a parent div "data-id", a state (which comes from the revision
    // table in Wagtail) and a tree describing the streamfields that might show
    // up
    var addContent = function(id, state, tree){
        var parentObject = $('.rr_parentblock[data-id=' + id + ']');

        if(tree.type == 'StreamBlock'){
            var treePath = parentObject.attr('data-treepath') + '/children/';
            for(var i in state){
                var item = state[i];
                var index = findNodeIndex(item.type, tree.children);
                var node = tree.children[index];
                var subId = Actions.pickBlock(treePath + index, parentObject, true);
                addContent(subId, item, node);
            }
        }

        if(tree.type == 'ListBlock'){
            var treePath = parentObject.attr('data-treepath') + '/children/';

            if(Helpers.has(state, 'value')){
                for(var i in state['value']){
                    var item = state['value'][i];
                    var subId = Actions.addChild(id, false, true, item);
                }
            } else if(Helpers.isArray(state)){
                for(var i in state){
                    var item = state[i];
                    var subId = Actions.addChild(id, false, true, item);
                }
            }
        }
    };

    // Take a tree and find the index of a node by name
    var findNodeIndex = function(name, tree){
        for(var i in tree){
            var node = tree[i];
            if(node.name == name){
                return i;
            }
        }
        return false;
    }

    return {
        'addContent': addContent,
    };
})();
