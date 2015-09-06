$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildDailyReportsTable);
    app.addListener('pagination', buildDailyReportsTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var reportsTableRowTemplate = $('#dailyReportsTableRow').html();
    var $adminDailyReportsTableBody = $('#adminDailyReportsTable').find('tbody');
    var $dailyReportsTableAjaxSpinner = $('.admin-dailyReports-table-ajax-spinner');
    var $paginationContainer = $('#paginationContainer');
    var paginationBodyTemplate = $('#paginationBody').html();
    var paginationItemTemplate = $('#paginationItem').html();


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
        var page = app.pageNumber || 1;

        // Reset app.pageNumber
        app.pageNumber = undefined;
        $.ajax({
            url: '/cost/api/admin/daily-reports?page=' + page + "&limit=10",
            method: 'get',
            beforeSend: dailyReportsTableAjaxInProgress
        }).done(function (response) {
            console.log(response);
            dailyReportsTableAjaxEnded(response);
        });
    }

    function dailyReportsTableAjaxInProgress () {
        // show the ajax spinner
        $dailyReportsTableAjaxSpinner.show();

        // Remove pagination
        $paginationContainer.html("");

        // empty the table body
        $adminDailyReportsTableBody.html("");
    }

    function dailyReportsTableAjaxEnded (response) {
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
        $adminDailyReportsTableBody.html( html.join("") );
    }

    function buildDailyReportsTableRow (data) {
        var css = "";
        if (!data.user) {
            css = app.helpers.makeRandomColor();
        }
        else {
            if (categoryColors[data.user._id]) {
                css = categoryColors[data.user._id]
            }
            else {
                css = categoryColors[data.user._id] = app.helpers.makeRandomColor();
            }
        }
        var html = reportsTableRowTemplate.replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[title]]', data.title)
            .replace('[[firstName]]', (data.user && data.user.name.first) || "")
            .replace('[[lastName]]', (data.user && data.user.name.last) || "")
            .replace('[[userId]]', (data.user && data.user._id) || "")
            .replace('[[color]]', css.color)
            .replace('[[body]]', data.body);
        return html;
    }


    /*
     * -------------------------
     *     PAGINATION CLICK EVENTS
     * -------------------------
     */
    $paginationContainer.on('click', function (e) {
        e.preventDefault();
        var $target = $(e.target.closest('li'));
        if (!$target.hasClass('active') && !$target.hasClass('disabled')) {
            app.pageNumber = $target.attr('data-page');
            app.emit('pagination');
            // Remove pagination from dom
            $('.pagination').remove();
        }
    })
});