$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildDailyReportsTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var reportsTableRowTemplate = $('#dailyReportsTableRow').html();
    var $adminDailyReportsTableBody = $('#adminDailyReportsTable').find('tbody');
    var $dailyReportsTableAjaxSpinner = $('.admin-dailyReports-table-ajax-spinner');

    var categoryColors = {};

    /*
     * ---------------------------------------------
     *     PAGE LOAD EVENT
     * ---------------------------------------------
     */
    app.emit('page.load');


    /*
     * ---------------------------------------------
     *     DAILY REPORTS TABLE
     * ---------------------------------------------
     */
    function buildDailyReportsTable () {
        $.ajax({
            url: '/cost/api/admin/daily-reports',
            method: 'get',
            beforeSend: dailyReportsTableAjaxInProgress()
        }).done(function (response) {
            dailyReportsTableAjaxEnded(response);
        });
    }

    function dailyReportsTableAjaxInProgress () {
        // show the ajax spinner
        $dailyReportsTableAjaxSpinner.show();
    }

    function dailyReportsTableAjaxEnded (response) {
        console.log(response);
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
        console.log(html.join(""));
        $adminDailyReportsTableBody.html( html.join("") );
    }

    function buildDailyReportsTableRow (data) {
        console.log(data);
        var html = reportsTableRowTemplate.replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[title]]', data.title)
            .replace('[[firstName]]', (data.user && data.user.name.first) || "")
            .replace('[[lastName]]', (data.user && data.user.name.last) || "")
            .replace('[[color]]', app.helpers.makeRandomColor().color)
            .replace('[[body]]', data.body);
        return html;
    }
});