$(function () {

    /*
     * ---------------------------------
     *     CUSTOM EVENT LISTENERS
     * ---------------------------------
     */
    app.addListener('page.load', buildUsersTable);
    app.addListener('usersTable.success', buildAmountField);

    /*
     * --------------------------------
     *       GLOBAL VARIABLES
     * --------------------------------
     */
    var $usersTable = $('.users-table');
    var $usersTableBody = $usersTable.find('tbody');
    var $usersTableAjaxSpinner =  $('.users-table-ajax-spinner');
    var userTemplate = $('#usersTableTemplate').html();

    var categoryColors = {};
    app.users = {};


    /*
     * -------------------------------
     *     EMIT PAGE LOAD EVENT
     * -------------------------------
     */
    app.emit('page.load');


    /*
     * -------------------------------
     *     USERS TABLE
     * -------------------------------
     */
    function buildUsersTable () {
        $.ajax({
            url: '/cost/api/admin/users/',
            method: 'get',
            beforeSend: usersTableAjaxInProgress
        }).done(function (response) {
            console.log(response);
            usersTableAjaxEnded(response);
        });
    }

    function usersTableAjaxInProgress () {
        $usersTableAjaxSpinner.show();
    }

    function usersTableAjaxEnded (response) {
        setTimeout(function () {
            // first hide the ajax spinner
            $usersTableAjaxSpinner.hide();

            if (response.success) {
                populateUsersTable(response.data);
                app.users = response.data;
            }
        }, 1000);
    }

    function populateUsersTable (data) {
        for (var i = 0, len = data.length; i < len; i++) {
            var userRow = renderSingleUser(data[i])
            $usersTableBody.append(userRow);
        }

        // emit success event of building the table
        app.emit('usersTable.success');
    }

    function renderSingleUser (user) {
        var css = app.helpers.makeRandomColor();
        var html = userTemplate.replace('[[color]]', css.color)
            .replace('[[highlight]]', css.highlight)
            .replace(/\[\[id\]\]/g, user._id)
            .replace('[[firstName]]', user.name.first)
            .replace('[[lastName]]', user.name.last)
            .replace('[[email]]', user.email)
            .replace('[[cellphone]]', user.profile.cellphone || "&#862;")
            .replace('[[homePhone]]', user.profile.homeAddress.tel || "&#862;");
        return html;
    }

    /*
     * ----------------------------------
     *      TOTAL EXPENSES BY EACH USER
     * ----------------------------------
     */
    function buildAmountField () {
        $.ajax({
            url: '/cost/api/admin/users/total-expenses',
            method: 'get'
        }).done(function (response) {
            console.log(response);
            if (response.success) {
                var data = {};
                response.data.forEach(function (elem, i) {
                    data[elem._id] = elem.total;
                });
                populateAmountField(data);
            }
        });
    }

    function populateAmountField (data) {
        var $amountFields = $('.user-total-amount');
        $amountFields.each(function (i, elem) {
            var id = $(elem).attr('data-user-id');
            $(elem).text(app.helpers.formatAmount(data[id] || 0) + " ﷼");
        });
    }

});