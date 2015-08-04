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
    var $formAjaxSpinner = $('.settings-form-ajax-spinner');
    var $successMsg = $('.vgn-success-msg');
    var $errorMsg = $('.vgn-error-msg');
    var $closeBtn = $('.close');
    var $settingsFormError = $('.settings-form-error-item');
    var $settingsFormGroup = $('.settings-form').find('.form-group');

    app.user = vgnUserProfile;

    /*
     * ---------------------
     *     PAGE LOAD INITIALIZATION
     * ---------------------
     */
    $('#profileSettings').show();

    /*
     * -------------------------
     *      HELPER FUNCTIONS
     * -------------------------
     */
    function extend (original, newObj) {
        for (var field in newObj) {
            if (newObj.hasOwnProperty(field)) {
                if (typeof original[field] !== 'undefined') {
                    original[field] = newObj[field];
                }
            }
        }
    }


    /*
     * -----------------------
     *     CLICK HANDLER FOR TAB SELECTION
     * ----------------------
     */
    $settingsTab.on('click', function (e) {
        var $target = $(e.target);

        // hide success or error messages
        cleanForm();

        if ($target.hasClass('settings-tab-list')) {
            $target.siblings().removeClass('settings-tab-active');
            $target.addClass('settings-tab-active');

            // hide all destination divs
            $settingsTabDestination.hide();

            var $targetDest = $($target.attr('data-target'));
            $targetDest.fadeIn(300);
        }

        populateSettingsForm ($targetDest);
    });

    function populateSettingsForm ($targetDest) {
        var $inputs = $targetDest.find('input');

        $inputs.each(function (i, elem) {
            $(elem).val( app.user[elem.name] );
        });
    }

    function cleanForm () {
        // hide messages
        $errorMsg.hide();
        $successMsg.hide();

        // first remove the class of .has-error
        $settingsFormGroup.removeClass('has-error');

        // clear the .settings-form-error-item
        $settingsFormError.html("");
    }

    /*
     * --------------------------------
     *     CLOSE CLICK HANDLER FOR ALERTS
     * --------------------------------
     */
    $closeBtn.on('click', function (e) {
        e.preventDefault();

        $(this).parent().hide();
    });


    /*
     * ----------------------------
     *      UPDATE FORM SUBMIT
     * ----------------------------
     */
    var inputMap = {
        profileFirstName: "name.first",
        profileLastName: 'name.last',
        profileEmail: 'email',
        profileCurrentPassword: 'password',
        profileNewPassword: 'newPassword',
        profileNewConfirm: 'confirmPassword',
        profileCellphone: 'profile.cellphone',
        profileHomeAddress: 'profile.homeAddress.address',
        profileHomeTel: 'profile.homeAddress.tel',
        profileHomeCity: 'profile.homeAddress.city',
        profileHomeCountry: 'profile.homeAddress.country'
    };


    $updateBtn.on('click', function (e) {
        var $this = $(this);
        var updateType = $this.attr('data-update-type');
        var $inputs = $this.closest('form').find('input');
        var formData = {};
        $inputs.each(function (i, elem) {
            formData[elem.name] = elem.value;
        });
        console.log(formData);
        updateUserAjax(formData, $this.attr('data-user-id'), updateType);
    });

    function updateUserAjax (data, userId, updateType) {
        $.ajax({
            url: '/cost/api/settings/' + userId + "?type=" + updateType,
            method: 'put',
            data: data,
            beforeSend: updateUserAjaxInProgress
        }).done(function (response) {
            setTimeout(function () {
                updateUserAjaxEnded(response, data);
            }, 500);
        });
    }

    function updateUserAjaxInProgress () {
        $settingsFormError.html("");
        $settingsFormGroup.removeClass('has-error');
        $formAjaxSpinner.show();
    }

    function updateUserAjaxEnded (response, data) {
        $formAjaxSpinner.hide();
        console.log(response);
        if (response.success) {
            showSuccessMsg(response);

            // update app.user
            extend(app.user, data);
        }
        else {
            showErrorMsg();
            populateFormWithErrors(response);
        }
    }

    function populateFormWithErrors (response) {
        if (response.validationErrors) {
            var errors = response.validationErrors;

            for (var elemName in errors) {
                if (errors.hasOwnProperty(elemName)) {
                    var $inputDiv = $('#' + elemName).closest('.form-group');
                    $inputDiv.addClass('has-error');
                    $inputDiv.find('p').html("&bullet;&nbsp;&nbsp;" + errors[elemName].msg);
                }
            }
        }
    }


    function showSuccessMsg (response) {
        $errorMsg.hide();
        $successMsg.show();
    }

    function showErrorMsg (response) {
        $successMsg.hide();
        $errorMsg.show();
    }


});
