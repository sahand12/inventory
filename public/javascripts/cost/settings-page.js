// Settings page tab configuration
$(function () {

    /*
     * ---------------------
     *     GLOBAL VARIABLES
     * ---------------------
     */
    var $settingsTab = $('.settings-tab');
    var $settingsTabDestination = $('.settings-tab-destination');
    var $updateBtn = $settingsTabDestination.find('button');

    /*
     * ---------------------
     *     PAGE LOAD INITIALIZATION
     * ---------------------
     */
    $('#profileSettings').show();

    /*
     * -----------------------
     *     CLICK HANDLER FOR TAB SELECTION
     * ----------------------
     */
    $settingsTab.on('click', function (e) {
        var $target = $(e.target);

        if ($target.hasClass('settings-tab-list')) {
            $target.siblings().removeClass('settings-tab-active');
            $target.addClass('settings-tab-active');

            // hide all destination divs
            $settingsTabDestination.hide();

            var $targetDest = $($target.attr('data-target'));
            $targetDest.fadeIn(300);
        }
    });


    /*
     * ----------------------------
     *      UPDATE FORM SUBMIT
     * ----------------------------
     */
    var validationRules = {
        
    }
    $updateBtn.on('click', function () {
        var $inputs = $(this).siblings('.form-group').find('input');
        var formData = {};
        var errors = {};
        $inputs.each(function (i, elem) {
            var name = elem.id;
            var value = elem.value;
            var type = elem.type;
            console.log(name, value, type);
        });

        validateUpdateInput(formData);
    });

    function validateUpdateInput (data) {

    }



});
