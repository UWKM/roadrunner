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


