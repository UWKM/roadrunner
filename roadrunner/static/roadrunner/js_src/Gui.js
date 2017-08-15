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
