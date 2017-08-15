(function () {
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
var Ajax = (function(){

    // id = dom data-id attribute of DOM element
    // value = id of image
    var initImage = function(domId, imageId){
        $.get('/_roadrunner/image/?id=' + imageId, function(data){
            if(!data){
                // no image returned
                return;
            }

            var target = $('div.rr_imagefield[data-id=' + domId + ']');
            $('div.chosen', target).show(0);
            $('div.preview-image img', target).attr('src', data);
            $('div.unchosen', target).hide(0);
        });
    };

    // id = dom data-id attribute of DOM element
    // value = id of document
    var initDocument = function(domId, documentId){
        $.get('/_roadrunner/document/?id=' + documentId, function(data){
            if(!data){
                // no image returned
                return;
            }

            var target = $('div.rr_documentfield[data-id=' + domId + ']');
            $('div.chosen', target).show(0);
            $('span.title').html(data);
            $('div.unchosen', target).hide(0);
        });
    };

    // id = dom data-id attribute of DOM element
    // value = id of page
    var initPage = function(domId, pageId){
        $.get('/_roadrunner/page/?id=' + pageId, function(data){
            if(!data){
                // no image returned
                return;
            }

            var target = $('div.rr_pagefield[data-id=' + domId + ']');
            $('div.chosen', target).show(0);
            $('span.title').html(data);
            $('div.unchosen', target).hide(0);
        });
    };

    return {
        'initImage': initImage,
        'initDocument': initDocument,
        'initPage': initPage,
    };
})();
var TEMPLATE_VARS = {
};

var PRIMITIVE_FIELDS = [
    'CharField',
    'ChoiceField',
    'IntegerBlock',
    'DateBlock',
    'BooleanBlock',
    'EmailBLock',
    'URLBlock',
    'ImageChooserBlock',
    'PageChooserBlock',
    'RichTextBlock',
    'DocumentChooserBlock',
    'ColorPickerBlock',
    'RawHTMLBlock',
    'TableBlock',
    'ModelChoiceField',
    //'ProductChooserBlock',
];

/*
-- Overview of all Django fields that might show up
'BigIntegerField',
'BinaryField',
'BooleanField',
'CharField',
'CommaSeparatedIntegerField',
'DateField',
'DateTimeField',
'DecimalField',
'DurationField',
'EmailField',
'FileField',
'FilePathField',
'FloatField',
'GenericIPAddressField',
'ImageField',
'IntegerField',
'NullBooleanField',
'PositiveIntegerField',
'PositiveSmallIntegerField',
'SlugField',
'SmallIntegerField',
'TextField',
'TimeField',
'URLField',
*/
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
var Events = (function(){

    // Sets up the DOM events we want to act on, passes it straight to Actions
    var setupEvents = function(){
        $(document).on('click', '.rr_action', function(event){
            event.preventDefault();
            event.stopPropagation();

            if($(this).hasClass('disabled')
              || $(this).parent().hasClass('disabled')) {
                return false;
            }

            var action = $(this).attr('data-action');
            var params = $(this).attr('data-params');

            if(typeof Actions[action] !== 'undefined'){
                Actions[action](params, $(this));
                Globals.lastAction = action;
            } else {
                console.log("Action not found: " + action);
            }
        });
    };

    var setupSaveEvents = function(){
        $("#page-edit-form input[type=submit], #page-edit-form button[type=submit]").click(function() {
            $("input[type=submit], button[type=submit]", $(this).parents("#page-edit-form")).removeAttr("clicked");
            $(this).attr("clicked", "true");
        });

        $("#page-edit-form").submit(function(e) {
            if(Globals.checked) return true;
            e.preventDefault();
            e.stopPropagation();

            var source = $("input[type=submit][clicked=true], button[type=submit][clicked=true]");
            var sourceType = false;
            var sourceValue = '';

            // Actions:
            // - action-save: save the current page, and reload it
            // - action-publish: publish the current page, return to main screen
            // - action-submit: save the current page for checking, reload it
            var action = 'action-save';

            if(source.length == 0){
                source = false;
            } else {
                sourceType = source.prop('nodeName');

                if(sourceType == 'INPUT'){
                    sourceValue = source.val();
                } else {
                    sourceValue = source.html();
                }

                var name = source.attr('name');
                if(name){
                    action = name;
                }
            }

            $('input[data-roadrunner=1]').remove();
            Gui.unFlagMissingFields();

            var errors = Gui.flagMissingFields();
            if(errors > 0){
                if(source !== false){
                    window.setTimeout(function(){
                        source.removeClass('button-longrunning-active');
                        source.removeAttr('disabled');
                        if(sourceType = 'BUTTON'){
                            source.html(sourceValue);
                        } else {
                            source.val(sourceValue);
                        }
                    }, 1000);
                }
                return Gui.showMessage('Er zijn errors gevonden in streamfields.  Controleer deze en sla de pagina opnieuw op.', false);
            }

            $('#page-edit-form').append('<input type="hidden" data-roadrunner="1" name="submit" value="' + action + '"/>');

            var url = $('#page-edit-form').attr('action');

            $.ajax({
                type: "POST",
                    url: url,
                    data: $("#page-edit-form").serialize(),
                    success: function(data) {
                        if(data.indexOf('{{PAGE_HAS_ERRORS}}') === -1){
                            Gui.showMessage('De pagina is opgeslagen', true);
                            Globals.checked = true;
                            if(source !== false){
                                source.removeClass('button-longrunning-active');
                                source.removeAttr('disabled');
                                if(sourceType = 'BUTTON'){
                                    source.html(sourceValue);
                                } else {
                                    source.val(sourceValue);
                                }

                                if(action == 'action-publish' || Globals.newPage){
                                    $('button[name=action-publish]').trigger('click');          
                                    // It seems as if it validates the
                                    // correctness of the page after saving,
                                    // and it needs to go the regular route
                                    // after submitting.
                                    /*
                                    // return to main page
                                    var link = $('ul.breadcrumb a').last();
                                    if(link.length > 0){
                                        window.setTimeout(function(){
                                            window.location = link.attr('href');
                                        }, 1500);
                                    }
                                    */
                                }
                            }
                        } else {
                            if(source !== false){
                                source.removeClass('button-longrunning-active');
                                source.removeAttr('disabled');
                                if(sourceType = 'BUTTON'){
                                    source.html(sourceValue);
                                } else {
                                    source.val(sourceValue);
                                }
                            }
                            var resultHtml = $.parseHTML(data);
                            var errorText = $('#errorText', resultHtml).html();
                            Gui.showMessage('De pagina is niet opgeslagen vanwege problemen:<br/><pre>' + errorText + '</pre>', false);
                            Gui.flagMissingFields();
                        }
                   }
                 });
        });
    };
        
    return {
        setupEvents: setupEvents,
        setupSaveEvents: setupSaveEvents,
    };
})();


// All our "global" variables
var Globals = {
    'tree': {},
    'json': {},
    'choices': {},
    'parentField': '',
    'idCount': 0,
    'errors': false,
    'colors': '',
    'newPage': true,
    'checked': false,
};
var Gui = (function(){

    // The root block wraps around all our streamfields
    var createRootBlock = function(tree, treePath, path){
        var node = Routing.getData(treePath, tree);
        var html = Html.getHtml(node.type);
        var id = Globals.idCount++;
        html.set('count', '0');
        html.set('order', '0');
        html.set('deleted', '');
        html.set('tree_path', treePath);
        html.set('path', path);
        html.set('id', id);
        html.set('label', '');
        html.set('block_header', '');
        $('div.rr_editor').html(html.html);
        return id;
    };

    // Sets up the editor given a tree that defines all the streamfields and a
    // state which is the content_json that's saved into the page revision
    var setupEditor = function(tree, state, rootEl){
        var rootId = createRootBlock(tree, '', rootEl);
        Content.addContent(rootId, state, Globals.tree);
    };

    // Show a streamblock blockpicker. Set "hide" to true if you only want to
    // set it up in the DOM, but not actually show it.
    var addBlockPicker = function(children, parentObj, hide){
        var html = Html.getHtml('_BlockPicker');
        var items = '';

        for(var i in children){
            var itemHtml = Html.getHtml('_BlockPickerItem');
            var child = children[i];
            var treePath = parentObj.attr('data-treepath') + '/children/' + i;
            if(child.icon){
                itemHtml.set('icon', child.icon);
            } else {
                itemHtml.set('icon', '');
            }
            itemHtml.set('tree_path', treePath);
            itemHtml.set('label', child.label);
            items += itemHtml.html;
        }
        html.set('items', items);
        html.set('id', parentObj.attr('data-id'));

        var addObj = $('.rr_addChild[data-id=' + parentObj.attr('data-id') + ']');
        addObj.html(html.html);
        if(!hide){
            addObj.fadeIn();
        }
    };

    var addBlock = function(block, count, treePath, path, parentObj, parentBlock, value){
        var lbParent = parentBlock.type == 'ListBlock';
        var hasValue = value !== null && typeof value !== 'undefined';

        var blockType = block.type;

        // Drill down on the actual type of this block, going to a primitive field
        if(PRIMITIVE_FIELDS.indexOf(blockType) === -1 && block.field && PRIMITIVE_FIELDS.indexOf(block.field.type) !== -1) {
            blockType = block.field.type;
        } else if(block.struct){
            blockType = 'StructBlock';
        }

        var html = Html.getHtml(blockType);
        var header = Html.getHtml('block_header');
        html.set('block_header', header.html);
        var id = Globals.idCount++;
        html.set('tree_path', treePath);
        html.set('count', 0);
        html.set('order', count);
        html.set('deleted', '');
        if(block.name == ''){
            //block.name = Helpers.resolveName(block);
        }
        html.set('type', block.name);

        if(block.field){
            if(block.field.help_text){
                html.set('help_text', block.field.help_text);
            } else {
                html.set('help_text', '');
            }

            if(block.field.required && block.field.required === true){
                html.set('required', 'required');
            }
        }
        html.set('required', '');

        var label = block.label;
        if(!block.label || block.label == ''){
            label = block.name;
            if(label == ''){
                label = Helpers.resolveName(block);
            }
        }

        html.set('placeholder', label);
        html.set('label', label);
        header.set('block_type', label);
        html.set('id', id);


        // TODO: Add max_length to various blocks: char/email/url..etc

        if(blockType == 'ChoiceField') {
            var choices = Globals.choices[block.field.choices];
            var choicesHtml = '';
            for(var i in choices){
                var choice = choices[i];
                if(hasValue && choice[0] == value) {
                    choicesHtml += '<option value="' + choice[0] + '" selected="selected">' + choice[1] + '</option>';
                } else {
                    choicesHtml += '<option value="' + choice[0] + '">' + choice[1] + '</option>';
                }
            }
            html.set('choices', choicesHtml);
        } else if (blockType == 'IntegerBlock') {
            if(block.field.max_value) {
                html.set('max', block.field.max_value);
            } else {
                html.set('max', '');
            }

            if(block.field.min_value) {
                html.set('min', block.field.min_value);
            } else {
                html.set('min', '');
            }
        } else if (blockType == 'ColorPickerBlock') {
            if(Globals.colors != ''){
                html.set('colors', Globals.colors);
            } else {
                html.set('colors', '');
            }
            if(!hasValue){
                // Set default value for color pickers
                html.set('value', '#FFF');
            }
        }

        if(hasValue){
            html.set('value', value);
        } else {
            html.set('value', '');
        }

        // If parent is a structblock, we do want the blockname in the path
        // NB: when a listblock has only 1 child, it'll try to adopt up the child's children
        //     and regard them as its own. This has one caveat, because when the single child
        //     is a StructBlock, we need a way to know this. This is why I added the "hasStruct"
        //     attribute. Don't confuse this with the "struct" attribute, because that one
        //     denotes whether the block is actually a real StructBlock itself (somewhere down
        //     the inheritance chain).

        if(parentBlock.hasStruct) {
            var tmp = path + block.name;
            html.set('path', Helpers.cleanPath(path + block.name));
        }
        else if(blockType == 'ListBlock' || blockType == 'StructBlock') {
            //html.set('path', path);
            html.set('path', Helpers.cleanPath(path));
        } else if (block.name !== '') {
            //html.set('path', path + block.name);
            html.set('path', Helpers.cleanPath(path + block.name));
        } else {
            // If there's no blockname, we don't want to have a '-' at the end
            // of our path, so we remove it
            // FYI: this only occurs when a block has only one child_block
            path = path.substring(0, path.length - 1);
            //html.set('path', path);
            html.set('path', Helpers.cleanPath(path));
        }

        parentObj.append(html.html);

        if(blockType == 'StructBlock'){
            var childCount = 0;
            var thisObj = $('.rr_children[data-id=' + id + ']');

            if(!lbParent){
                var subPath = Helpers.cleanPath(path + '-value-');
            } else {
                var subPath = Helpers.cleanPath(path + block.name + '-');
            }

            for(var i in block.children){
                var child = block.children[i];
                var subTreePath = treePath + '/children/' + i;

                // TODO: add values, if they're there
                addBlock(child, childCount, subTreePath + '/children/' + i, subPath, thisObj, block);
                childCount++;
            }
        }

        // Special initializations for special block types
        if(hasValue) {
            if(blockType == 'StreamBlock'){
                Content.addContent(id, value, Routing.getData(treePath));
            }

            if(blockType == 'ImageChooserBlock'){
                Ajax.initImage(id, value);
            }

            if(blockType == 'DocumentChooserBlock'){
                Ajax.initDocument(id, value);
            }

            if(blockType == 'PageChooserBlock'){
                Ajax.initPage(id, value);
            }

            if(blockType == 'ListBlock'){
                Content.addContent(id, value, Routing.getData(treePath));
            }
        }

        return id;
    };

    var addListWrapper = function(target, count, path, label){
        var html = Html.getHtml('ListWrapper');
        var header = Html.getHtml('block_header');
        var id = Globals.idCount++;

        html.set('path', Helpers.cleanPath(path));
        html.set('block_header', header.html);
        html.set('id', id);
        html.set('deleted', '');
        html.set('order', count);

        if(label) {
            html.set('label',label);
        } else {
            html.set('label', '');
        }

        target.append(html.html);
        return $('.rr_block[data-id=' + id + '] .rr_children');
    };

    // Shows a message on the top of the page and scrolls to it
    var showMessage = function(msg, succes){
        var showMsg = function(){
            var cssClass = succes ? 'success' : 'error';
            $('div.messages').html(
                '<ul><li class="' + cssClass + '">' + msg + '</li></ul>'
            );

            $('div.messages').fadeIn();

            $('html, body').animate({
                scrollTop: 0
            }, 500);

        };

        if($('div.messages').length > 0){
            $('div.messages').fadeOut(400, showMsg);
        } else {
            showMsg();
        }
    };

    // Flag all the inputs/textareas/selects that are required but have no
    // value
    var flagMissingFields = function(){
        var fields = 'input[data-required=required], '
            + 'select[data-required=required], ' 
            + 'textarea[data-required=required]';

        var flagged = 0;

        // Inputs
        $(fields).filter(function() {
            if(!this.value){
                flagged++;
            }
            return !this.value;
        }).addClass("missing");

        $('textarea.missing').each(function(){
            $(this).prev().addClass('missing');
        });

        /* Expand all missing fields */
        $('.missing').each(function(){
            $(this).parents('.rr_block').each(function(){
                $(this).children('.rr_block_header').each(function(){
                    $('.rr_action[data-action=extend]', $(this)).trigger('click');
                });
            });
        });

        return flagged;
    };

    var unFlagMissingFields = function(){
        $('.missing').removeClass('missing');
    };

    return {
        'setupEditor': setupEditor,
        'addBlockPicker': addBlockPicker,
        'addBlock': addBlock,
        'addListWrapper': addListWrapper,
        'showMessage': showMessage,
        'flagMissingFields': flagMissingFields,
        'unFlagMissingFields': unFlagMissingFields,
    };
})();
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
var HtmlCache = {
'_BlockPicker': '<ul>{{items}}</ul>',

'StructBlock': '<div class="rr_block rr_structblock rr_parentblock" data-treepath="{{tree_path}}" data-path="{{path}}" data-id="{{id}}">    {{block_header}}    <div class="rr_block_content">        <input type="hidden" name="{{path}}-order"   value="{{order}}"   class="rr_order" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-deleted" value="{{deleted}}" class="rr_deleted" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-type"    value="{{type}}"/>        <div class="rr_children" data-id="{{id}}"></div>    </div></div>',

'URLBlock': '<div class="rr_urlfield rr_block url_field">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" data-required="{{required}}" name="{{path}}" placeholder="{{placeholder}}" value="{{value}}" type="url" />            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'IntegerBlock': '<div class="rr_integerfield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" data-required="{{required}}" max="{{max}}" min="{{min}}" name="{{path}}" placeholder="{{placeholder}}" value="{{value}}" type="number" />            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'ModelChoiceField': '<div class="rr_modelchoicefield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="field char_field widget-text_input fieldname-title grid-title">            <div class="field-content">                <div class="input">                    <input data-id="{{id}}" data-required="required" maxlength="50" name="{{path}}" placeholder="{{placeholder}}" value="{{value}}" type="text" />                    <span class="help">{{help_text}}</span>                </div>            </div>        </div>    </div></div>',

'ColorPickerBlock': '<div class="rr_colorpicker rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" data-required="{{required}}" maxlength="10" name="{{path}}" placeholder="{{placeholder}}" value="{{value}}" type="text" />            <span class="help">{{help_text}}</span>        </div>    </div></div><script type="text/javascript">    var field = $(\'input[data-id={{id}}]\');    field.wrap(\'<div class="bfh-colorpicker" data-color="{{value}}" data-name="{{path}}" data-colors="{{colors}}"></div>\');    $colorpicker = field.parent();    $colorpicker.bfhcolorpicker($colorpicker.data());</script>',

'ImageChooserBlock': '<div class="rr_imagefield rr_block" data-id="{{id}}">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <div id="{{path}}-chooser" class="chooser image-chooser blank">                <div class="chosen">                    <div class="preview-image">                        <img>                    </div>                    <ul class="actions">                        <!-- <li><button type="button" class="button action-clear button-small button-secondary">Leeg keuze</button></li> -->                        <li><button type="button" class="button action-choose button-small button-secondary">Kies een andere afbeelding</button></li>                        <!-- <li><a href="" class="edit-link button button-small button-secondary" target="_blank">Wijzig deze afbeelding</a></li> -->                    </ul>                </div>                <div class="unchosen">                    <button type="button" class="button action-choose button-small button-secondary">Kies een afbeelding</button>                </div>            </div>            <input id="{{path}}" value="{{value}}" name="{{path}}" placeholder="Afbeelding" type="hidden">            <script>createImageChooser("{{path}}");</script>            <span></span>            <span class="help">{{help_text}}</p>        </div>    </div></div>',

'RawHTMLBlock': '<div class="rr_htmlblock rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <textarea data-id="{{id}}" data-required="{{required}}" name="{{path}}" cols="40" rows="10" placeholder="{{placeholder}}">{{value}}</textarea>            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'DateBlock': '<div class="rr_datefield rr_block date_field">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input id="{{path}}" name="{{path}}" data-required="{{required}}" placeholder="Datum" type="text" value="{{value}}" />            <script>initDateChooser("{{path}}", {"dayOfWeekStart": 1, "format": "Y-m-d"});</script>            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'ListWrapper': '<div class="rr_block rr_listwrapper rr_parentblock" data-id="{{id}}">    {{block_header}}    <div class="rr_block_content">        <input type="hidden" name="{{path}}-order"   value="{{order}}" class="rr_order" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-deleted" value="{{deleted}}" class="rr_deleted" data-id="{{id}}"/>        <div class="rr_children" data-id="{{id}}">                </div>    </div></div>',

'block_header': '<div class="rr_block_header">    <div class="block_title">{{label}}</div>    <div class="button-group button-group-square">        <button type="button" title="Collapse"               data-action="collapse" data-params="{{id}}" class="rr_action button icon text-replace hover-no icon-cross toggle-button">Collapse</button>        <button type="button" title="Verplaats naar boven"   data-action="moveUp"   data-params="{{id}}" class="rr_action button icon text-replace icon-order-up">Verplaats naar boven</button>        <button type="button" title="Verplaats naar beneden" data-action="moveDown" data-params="{{id}}" class="rr_action button icon text-replace icon-order-down">Verplaats naar beneden</button>        <button type="button" title="Verwijderen"            data-action="delete"   data-params="{{id}}" class="rr_action button icon text-replace hover-no icon-bin">Verwijderen</button>    </div>    <br class="clearfix" /></div>',

'TableBlock': '<div class="rr_tablefield rr_block">    <div class="rr_block_content">        <div class="input">            <div class="field boolean_field widget-checkbox_input">                <label for="{{path}}-handsontable-header">Rij-header</label>                <div class="field-content" style="width: 80%;">                    <div class="input">                        <input id="{{path}}-handsontable-header" name="{{path}}-handsontable-header" type="checkbox" />                    </div>                    <p class="help">Geef de eerste rij weer als een header.</p>                </div>            </div>            <br/>            <div class="field boolean_field widget-checkbox_input">                <label for="{{path}}-handsontable-col-header">Kolomheader</label>                <div class="field-content" style="width: 80%;">                    <div class="input">                        <input id="{{path}}-handsontable-col-header" name="{{path}}-handsontable-col-header" type="checkbox" />                    </div>                    <p class="help">Geef de eerste kolom als een header weer.</p>                </div>            </div>            <br/>            <div id="{{path}}-handsontable-container" style="height: 135px; overflow: hidden; width: 100%;" class="handsontable"></div>            <!-- old table value:                {&quot;data&quot;:[[null,&quot;&quot;,null,null],[null,null,null,null],[null,null,null,null],[null,null,null,null]],&quot;first_row_is_table_header&quot;:false,&quot;first_col_is_header&quot;:false}            -->            <input id="{{path}}" name="{{path}}" placeholder="Tabel" value="{{value}}" type="hidden" />            <script>                initTable("{{path}}", {"minSpareRows": 0, "startRows": 4, "height": 108, "autoColumnSize": false, "renderer": "text", "startCols": 4, "stretchH": "all", "language": "nl", "rowHeaders": false, "contextMenu": true, "editor": "text", "colHeaders": false});            </script>            <span></span>            <p class="help">HTML is mogelijk in de tabel</p>        </div>    </div></div>',

'_BlockPickerItem': '<li>    <button type="button" data-action="pickBlock" data-params="{{tree_path}}" data-id="{{id}}" class="rr_action button icon icon-{{icon}}"><span>{{label}}</span></button></li>',

'EmailBlock': '<div class="rr_emailfield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" data-required="{{required}}" name="{{path}}" placeholder="{{placeholder}}" type="email" value="{{value}}"/>            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'StreamBlock': '<div class="rr_streamblock rr_parentblock" data-treepath="{{tree_path}}" data-path="{{path}}" data-id="{{id}}">    <div class="rr_block_content">        <input type="hidden" name="{{path}}-count"   value="{{count}}"   class="rr_count" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-order"   value="{{order}}"   class="rr_order" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-deleted" value="{{deleted}}" class="rr_deleted" data-id="{{id}}"/>        <div class="rr_children" data-id="{{id}}"></div>        <button type="button" data-action="addChild" data-params="{{id}}" class="rr_action addChild button bicolor icon icon-plus">Voeg <em>{{label}}</em> toe</button>        <div class="stream-menu">            <div class="rr_addChild stream-menu-inner" data-id="{{id}}">            </div>        </div>    </div></div>',

'ListBlock': '<div class="rr_block rr_listblock rr_parentblock" data-id="{{id}}" data-treepath="{{tree_path}}" data-path="{{path}}">    {{block_header}}    <div class="rr_block_content">        <!--             NB: we need the 2 count inputs here, because of some edge-cases in which wagtail expects            the count under PATH-count instead of PATH-value-count        -->        <input type="hidden" name="{{path}}-value-count"   value="{{count}}" class="rr_count" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-count"   value="{{count}}" class="rr_count" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-order"   value="{{order}}" class="rr_order" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-deleted" value="{{deleted}}" class="rr_deleted" data-id="{{id}}"/>        <input type="hidden" name="{{path}}-type"    value="{{type}}"/>        <div class="rr_children" data-id="{{id}}"></div>        <button type="button" data-action="addChild" data-params="{{id}}" class="rr_action addChild button bicolor icon icon-plus">Voeg <em>{{label}}</em> toe</button>        <div class="rr_addChild" data-id="{{id}}">        </div>    </div></div>',

'PageChooserBlock': '<div class="rr_pagefield rr_block" data-id="{{id}}">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <div id="{{path}}-chooser" class="chooser page-chooser blank">                <div class="chosen">                    <span class="title"></span>                    <ul class="actions">                        <!-- <li><button type="button" class="button action-clear button-small button-secondary">Leeg keuze</button></li> -->                        <li><button type="button" class="button action-choose button-small button-secondary">Kies een andere pagina</button></li>                        <!-- <li><a href="" class="edit-link button button-small button-secondary" target="_blank">Wijzig deze pagina</a></li> -->                    </ul>                </div>                <div class="unchosen">                    <button type="button" class="button action-choose button-small button-secondary">Kies een pagina</button>                </div>            </div>            <input id="{{path}}" name="{{path}}" placeholder="Pagina" value="{{value}}" type="hidden">            <script>createPageChooser("{{path}}",["wagtailcore.page"], null, true);</script>            <span></span>            <span class="help">{{help_text}}</p>        </div>    </div></div>',

'ChoiceField': '<div class="rr_choicefield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="field char_field widget-text_input fieldname-title grid-title">            <div class="field-content">                <div class="input">                    <select name="{{path}}" data-required="{{required}}" placeholder="{{placeholder}}">                        {{choices}}                    </select>                    <span class="help">{{help_text}}</span>                </div>            </div>        </div>    </div></div>',

'BooleanBlock': '<div class="rr_booleanfield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" name="{{path}}" placeholder="{{placeholder}}" type="checkbox" {{value}} /><br/>            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'CharField': '<div class="rr_charfield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <input data-id="{{id}}" data-required="{{required}}" maxlength="50" name="{{path}}" placeholder="{{placeholder}}" value="{{value}}" type="text" />            <span class="help">{{help_text}}</span>        </div>    </div></div>',

'RichTextBlock': '<div class="rr_richtextfield rr_block">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <textarea cols="40" data-required="{{required}}" id="{{path}}" name="{{path}}" placeholder="{{placeholder}}" rows="10" style="display: none;">{{value}}</textarea>            <script>makeHalloRichTextEditable("{{path}}");</script>            <span></span>            <span class="help">{{help_text}}</p>        </div>    </div></div>',

'DocumentChooserBlock': '<div class="rr_documentfield rr_block" data-id="{{id}}">    <div class="rr_block_content">        <label class="{{required}}" for="{{path}}">{{label}}</label>        <div class="input">            <div id="{{path}}-chooser" class="chooser document-chooser blank">                <div class="chosen">                    <span class="title"></span>                    <ul class="actions">                        <!-- <li><button type="button" class="button action-clear button-small button-secondary">Leeg keuze</button></li> -->                        <li><button type="button" class="button action-choose button-small button-secondary">Kies een ander document</button></li>                        <!-- <li><a href="" class="edit-link button button-small button-secondary" target="_blank">Wijzig dit document</a></li> -->                    </ul>                </div>                <div class="unchosen">                    <button type="button" class="button action-choose button-small button-secondary">Kies een document</button>                </div>            </div>            <input id="{{path}}" name="{{path}}" placeholder="Document" value="{{value}}" type="hidden">            <script>createDocumentChooser("{{path}}");</script>            <span></span>            <span class="help">{{help_text}}</p>        </div>    </div></div>',
};
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
$(document).ready(function(){
    var init = function(){
        // TODO: Add error checking for missing fields
        Globals.tree = rr_data.tree;

        Globals.parentField = rr_data.tree.name;
        Globals.json        = rr_data.json;
        Globals.choices     = rr_data.choices;
        Globals.errors      = rr_data.errors;
        Globals.colors      = rr_data.colors;
        delete window.rr_data;

        // Find root element of streamfields
        var rootEl = Globals.tree.name;
        var rootVal = Globals.json[rootEl];
        var state = false;
        try {
            var parsed = JSON.parse(rootVal);
            state = parsed;
            Globals.newPage = false;
            console.log('========= STATE ==========');
            console.log(state);
            console.log('==========================');
            console.log('======== TREE ==========');
            console.log(Globals.tree);
            console.log('========================');
            console.log('========= ERRORS ===========');
            console.log(Globals.errors);
            console.log('============================');
            console.log('========= Colors ===========');
            console.log(Globals.colors);
            console.log('============================');
        } catch(error){
            Globals.newPage = true;
            console.log("Can't parse current value, starting with an empty tree");
            // Can't parse current value, so starting with an empty tree
        }

        var types = collectTypes(Globals.tree);

        function onlyUnique(value, index, self) {
            return self.indexOf(value) === index;
        }

        /*
        var unique = types.filter(onlyUnique);
        console.log("UNIQUE TYPES");
        console.log(unique);
        */

        Gui.setupEditor(Globals.tree, state, rootEl);

        Events.setupEvents();
        Events.setupSaveEvents();
    };
    init();
});


/* ============================================= */
/* DEBUGGING examples */

// This shows how to collect all the different streamtypes and filter out all
// the uniques

/*
var types = collectTypes(Globals.tree);

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

var unique = types.filter(onlyUnique);
*/

var collectTypes = function(tree){
    var result = [];

    var blockType = tree.type;

    if(PRIMITIVE_FIELDS.indexOf(blockType) === -1 && tree.field && PRIMITIVE_FIELDS.indexOf(tree.field.type) !== -1) {
        blockType = tree.field.type;
    }

    if(!tree.struct){
        result.push(blockType);
    }
    for(var i in tree.children){
        var child = tree.children[i];
        result = result.concat(collectTypes(child));
    }
    return result;
};
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
})();}());

