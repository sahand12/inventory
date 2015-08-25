$(function () {

    /*
     * -----------------------------
     *     EVENT LISTENERS
     * -----------------------------
     */
    app.addListener('page.load', buildUserDailyReportsTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var reportsTableRowTemplate = $('#userDailyReportsTableRow').html();
    var $adminUserDailyReportsTableBody = $('#adminUserDailyReportsTable').find('tbody');
    var $dailyReportsTableAjaxSpinner = $('.admin-userDailyReports-table-ajax-spinner');

    var categoryColors = {};


    /*
     * -------------------------
     *     PAGE LOAD EVENT
     * -------------------------
     */
    app.emit('page.load');


    /*
     * --------------------------
     *     USER DAILY REPORTS TABLE
     * --------------------------
     */
    function buildUserDailyReportsTable () {
        var userId = $adminUserDailyReportsTableBody.attr('data-user-id');
        $.ajax({
            url: '/cost/api/admin/users/' + userId + "/daily-reports",
            method: 'get',
            beforeSend: userDailyReportsTableAjaxInProgress
        }).done(function (response) {
            userDailyReportsTableAjaxEnded(response);
        });
    }

    function userDailyReportsTableAjaxInProgress () {
        $dailyReportsTableAjaxSpinner.show();
    }

    function userDailyReportsTableAjaxEnded (response) {
        // hide the ajax spinner
        $dailyReportsTableAjaxSpinner.hide();

        if (response.success) {
            populateDailyReportsTable(response.data);
        }
    }

    function populateDailyReportsTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push(buildDailyReportsTableRow(data[i]));
        }
        $adminUserDailyReportsTableBody.html( html.join("") );
    }

    function buildDailyReportsTableRow (data) {
        var html = reportsTableRowTemplate.replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[title]]', data.title)
            .replace('[[color]]', app.helpers.makeRandomColor().color)
            .replace('[[body]]', data.body);
        return html;
    }
});