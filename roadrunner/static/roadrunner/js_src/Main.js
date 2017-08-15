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
