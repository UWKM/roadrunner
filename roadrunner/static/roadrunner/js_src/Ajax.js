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
