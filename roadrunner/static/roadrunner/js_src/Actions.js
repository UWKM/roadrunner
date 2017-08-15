var Actions = (function(){

    // Add a child to a listBlock or StreamBlock 
    var addChild = function(parentId, source, noPicker, value){
        var parentObj = $('.rr_parentblock[data-id=' + parentId + ']');
        var treePath = parentObj.attr('data-treepath');
        var par = Routing.getData(treePath, Globals.tree);

        // If we're dealing with a StreamBlock you first show the options from
        // which someone selects the child
        if(par.type == 'StreamBlock'){
            Gui.addBlockPicker(par.children, parentObj, noPicker);
        }

        if(par.type == 'ListBlock'){
            var countObj = $('.rr_count[data-id=' + parentId + ']');
            var count = parseInt(countObj.val());
            countObj.val(count + 1);

            var target = $('.rr_children[data-id=' + parentId + ']');

            if(par.children.length == 1) {
                var path = parentObj.attr('data-path') + '-' + count;
            } else {
                var path = parentObj.attr('data-path') + '-value-' + count;
            }

            var wrapper = Gui.addListWrapper(target, count, path, par.label);
            for(var i in par.children){
                var subTreePath = treePath + '/children/' + i;
                var subPath = path;
                 
                subPath += '-value-';

                // if treepath is empty, you don't want a slash on front
                if(subTreePath[0] == '/'){
                    subTreePath = subTreePath.substring(1);
                }

                var child = par.children[i];
                var subValue = null;

                if(value){
                    if(Helpers.has(value, child.name)) {
                        subValue = value[child.name];
                    } else {
                        subValue = value;
                        if(typeof subValue === 'object'){
                            subValue = null;
                        }
                    }
                }

                Gui.addBlock(child, count, subTreePath, subPath, wrapper, par, subValue);
            }
        }
    };


    // Select a child block in a StreamBlock
    var pickBlock = function(params, source, noFirst){
        var id = source.attr('data-id');
        var parentObj = $('.rr_parentblock[data-id=' + id + ']');

        if(!noFirst){
            $('.rr_addChild[data-id=' + id + ']').fadeOut();
        }

        var block = Routing.getData(params);
        var countObj = $('.rr_count[data-id=' + id + ']');
        var count = parseInt(countObj.val());
        var path = parentObj.attr('data-path') + '-' + count;
        var par = Routing.getData(parentObj.attr('data-treepath'), Globals.tree);
        countObj.val(count + 1);

        var subId = Gui.addBlock(block, count, params, path, $('.rr_children[data-id=' + id + ']'), par);

        // Check if the child block is a ListBlock, in that case we can add a
        // first child to that ListBlock
        if(!noFirst && block.type == 'ListBlock'){
            addChild(subId, $('.rr_parentblock[data-id=' + subId + ']'));
        }

        return subId;
    };

    var deleteItem = function(id, source){
        var obj = $('.rr_parentblock[data-id=' + id + ']');
        var parentId = obj.parent().attr('data-id');

        // Remove DOM object
        obj.remove();

        // Lower parent count
        var countObj = $('input.rr_count[data-id=' + parentId + ']');
        var count = countObj.val();
        count--;
        countObj.val(count);

        // Reorder siblings
        var order = 0;
        $('div.rr_children[data-id=' + parentId + ']').children().each(function(){
            var childId = $(this).attr('data-id'); 
            var orderObj = $('input.rr_order[data-id=' + childId + ']').val(order);
            order++;
        });
    };

    var moveUp = function(id, source){
        var obj = $('.rr_parentblock[data-id=' + id + ']');
        var objOrder = $('.rr_order[data-id=' + id + ']').val();

        var prevObj = obj.prev();
        if(!prevObj.length) {
            return false;
        }

        var prevId = prevObj.attr('data-id');
        var prevOrder = $('.rr_order[data-id=' + prevId + ']').val();

        obj.detach();
        prevObj.before(obj);

        $('.rr_order[data-id=' + id + ']').val(prevOrder);
        $('.rr_order[data-id=' + prevId + ']').val(objOrder);
    };

    var moveDown = function(id, source){
        var obj = $('.rr_parentblock[data-id=' + id + ']');
        var objOrder = $('.rr_order[data-id=' + id + ']').val();

        var nextObj = obj.next();

        if(!nextObj.length){
            return false;
        }

        var nextId = nextObj.attr('data-id');
        var nextOrder = $('.rr_order[data-id=' + nextId + ']').val();

        obj.detach();
        nextObj.after(obj);

        $('.rr_order[data-id=' + id + ']').val(nextOrder);
        $('.rr_order[data-id=' + nextId + ']').val(objOrder);
    };

    var collapse = function(id, source){
        var obj = $('.rr_parentblock[data-id=' + id + '] > .rr_block_content');
        var newbutton = '<button type="button" title="Extend" data-action="extend" data-params="'+ id +'" class="rr_action button icon text-replace hover-no toggle-button icon-plus">Extend</button>'
        var button = $('.rr_parentblock[data-id=' + id + '] > .rr_block_header > div > button[data-action=collapse]');

        button.replaceWith(newbutton);
        obj.hide();
    }

    var extend = function(id, source){
        var obj = $('.rr_parentblock[data-id=' + id + '] > .rr_block_content');
        var newbutton = '<button type="button" title="Collapse" data-action="collapse" data-params="'+ id +'" class="rr_action button icon text-replace hover-no icon-cross toggle-button">Collapse</button>'
        var button = $('.rr_parentblock[data-id=' + id + '] > .rr_block_header > div > button[data-action=extend]');

        button.replaceWith(newbutton)
        obj.show();
    }

    return {
        'addChild':  addChild,
        'pickBlock': pickBlock,
        'delete':    deleteItem,
        'moveUp':    moveUp,
        'moveDown':  moveDown,
        'collapse':  collapse,
        'extend':    extend,
    }
})();
