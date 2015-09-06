$(function () {

    /*
     * -----------------------------
     *     EVENT LISTENERS
     * -----------------------------
     */
    app.addListener('page.load', buildUserDailyReportsTable);
    app.addListener('pagination', buildUserDailyReportsTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var reportsTableRowTemplate = $('#userDailyReportsTableRow').html();
    var $adminUserDailyReportsTableBody = $('#adminUserDailyReportsTable').find('tbody');
    var $dailyReportsTableAjaxSpinner = $('.admin-userDailyReports-table-ajax-spinner');
    var $paginationContainer = $('#paginationContainer');
    var paginationBodyTemplate = $('#paginationBody').html();
    var paginationItemTemplate = $('#paginationItem').html();

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
        var page = app.pageNumber || 1;
        var userId = $adminUserDailyReportsTableBody.attr('data-user-id');

        // Reset app.pageNumber
        app.pageNumber = undefined;
        $.ajax({
            url: '/cost/api/admin/users/' + userId + "/daily-reports?page=" + page + "&limit=10",
            method: 'get',
            beforeSend: userDailyReportsTableAjaxInProgress
        }).done(function (response) {
            userDailyReportsTableAjaxEnded(response);
        });
    }

    function userDailyReportsTableAjaxInProgress () {
        // show the ajax spinner
        $dailyReportsTableAjaxSpinner.show();

        // Remove pagination
        $paginationContainer.html("");

        // Empty table body
        $adminUserDailyReportsTableBody.html("");
    }

    function userDailyReportsTableAjaxEnded (response) {
        // hide the ajax spinner
        $dailyReportsTableAjaxSpinner.hide();

        if (response.success) {
            populateDailyReportsTable(response.data.data);
            var $pagination = app.helpers.buildPagination({
                pagesData: response.data.pages,
                bodyTmpl: paginationBodyTemplate,
                itemTmpl: paginationItemTemplate
            });
            $paginationContainer.html($pagination);
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


    /*
     * --------------------------
     *     PAGINATION CLICK EVENTS
     * --------------------------
     */
    $paginationContainer.on('click', function (e) {
        e.preventDefault();
        var $target = $(e.target.closest('li'));
        if (!$target.hasClass('active') && !$target.hasClass('disabled')) {
            app.pageNumber = $target.attr('data-page');
            app.emit('pagination');
            $('.pagination').remove();
        }
    })
});