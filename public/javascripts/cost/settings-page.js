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
            updateUserAjaxEnded(response);
        });
    }

    function updateUserAjaxInProgress () {

    }

    function updateUserAjaxEnded (response) {
        console.log(response);
    }


});
