// public/javascripts/cost/admin/expenses-page.js
$(function () {

    /*
     * -----------------------
     *      EVENT LISTENERS
     * -----------------------
     */
    app.addListener('page.load', buildAdminExpensesTable);
    app.addListener('page.load', buildAdminTotalExpensesPieChart);
    app.addListener('expense.form.submit.success', buildAdminExpensesTable);
    app.addListener('expense.form.submit.success', buildAdminTotalExpensesPieChart);
    app.addListener('expense.pagination', buildAdminExpensesTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var $adminExpensesTableBody = $('#adminExpensesTable').find('tbody');
    var $adminExpensesTableAjaxSpinner = $('.admin-all-expenses-table-ajax-spinner');
    var totalPieChartCtx = $('#totalExpensesPieChart')[0].getContext('2d');
    var $totalExpensesWidget = $('.total-expenses-widget');
    var $totalPieChartStats = $('#totalPieCharStats');
    var $totalExpensesAjaxSpinner = $('.admin-total-expenses-ajax-spinner');
    var $totalExpensesAmount = $('#totalExpensesAmount');
    var $paginationContainer = $('#paginationContainer');
    var paginationBodyTemplate = $('#paginatinBody').html();
    var paginationItemTemplate = $('#paginationItem').html();

    var adminExpensesTableTemplate = $('#adminExpensesTableTemplate').html();

    var categoryColors = {};


    /*
     * ---------------------------
     *     GLOBAL SINGLETON
     * ---------------------------
     */
    app.adminExpensesPageData = {};


    /*
     * ---------------------
     *     EMIT PAGE LOAD EVENT
     * ---------------------
     */
    app.emitEvent('page.load');


    /*
     * ----------------------------
     *     ADMIN EXPENSES TABLE
     * ---------------------------
     */
    function buildAdminExpensesTable () {
        var page = app.pageNumber || 1;

        // Reset app.pageNumber
        app.pageNumber = undefined;
        $.ajax({
            method: 'get',
            url: '/cost/api/admin/expenses?page=' + page,
            beforeSend: adminExpensesTableAjaxInProgress
        }).done(function (response) {
            adminExpensesTableAjaxEnded(response);
        });
    }

    function adminExpensesTableAjaxInProgress () {
        // empty the table <tbody>
        $adminExpensesTableBody.html("");

        // Remove pagination
        $paginationContainer.html("");

        // Show the spinner
        $adminExpensesTableAjaxSpinner.show();
    }

    function adminExpensesTableAjaxEnded (response) {
        // hide the spinner
        $adminExpensesTableAjaxSpinner.hide();

        app.adminExpensesPageData = reformatTableData(response.data.data, categoryColors);
        populateAdminExpensesTable(response.data.data);
        buildPagination(response.data.pages);
    }

    function reformatTableData (data, categoryColors) {
        var formatted = {};
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            if (typeof categoryColors[current.category.name] === 'undefined') {
                var css = app.helpers.makeRandomColor();
                categoryColors[current.category.name] = { color: css.color, highlight: css.highlight };
            }
            formatted[current._id] = current;
        }
        return formatted;
    }

    function populateAdminExpensesTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push( buildAdminExpensesTableRow(data[i]) );
        }
        $adminExpensesTableBody.html( html.join("") );

        $('[data-toggle=popover]').popover({
            placement: 'auto bottom',
            template: '<div class="popover" role="tooltip"><div class="row"></div><h3 class="popover-title" style="letter-spacing: 1px;"></h3><div class="popover-content"></div></div>',
            title: 'Expense Description',
            content: 'No Description',
            trigger: 'hover click'
        });
    }

    function buildAdminExpensesTableRow (data) {
        if (!data.user) {
            data.user = { name: { first: "", last: "" } };
        }
        var html = adminExpensesTableTemplate.replace('[[color]]', categoryColors[data.category.name].color)
            .replace('[[id]]', data._id)
            .replace('[[description]]', data.description)
            .replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[title]]', data.title)
            .replace('[[username]]', data.user.name.first + " " + data.user.name.last)
            .replace('[[categoryName]]', data.category.name)
            .replace('[[amount]]', app.helpers.formatAmount(data.amount) + " " + app.helpers.currencySymbol);
        return html;
    }

    function buildPagination (pagesData) {
        if (pagesData.total <= 1) return;
        var leftDisabled = (pagesData.hasPrev ? "" : "disabled");
        var rightDisabled = (pagesData.hasNext ? "" : "disabled");
        var paginationHtml = paginationBodyTemplate.replace('[[prev]]', pagesData.prev)
            .replace('[[leftDisabled]]', leftDisabled)
            .replace('[[rightDisabled]]', rightDisabled)
            .replace('[[next]]', pagesData.next);
        console.log(paginationHtml);
    }

    /*
     * --------------------------
     *      TOTAL PIE CHART
     * --------------------------
     */
    function buildAdminTotalExpensesPieChart() {

    }

});
