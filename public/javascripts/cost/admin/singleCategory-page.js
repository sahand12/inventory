// public/javascripts/cost/admin/singleCategory-page.js
$(function () {

    /*
     * ----------------------------
     *     EVENT LISTENERS
     * ----------------------------
     */
    app.addListener('page.load', buildCategoryExpensesTable);
    app.addListener('category.response.success', buildSummaryTable);
    app.addListener('search.button.click', buildCategoryExpensesTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var categoryExpenseTableRowTemplate = $('#singleCategoryExpensesTemplateTableRow').html();
    var $categoryExpensesTableBody = $('#adminSingleCategoryTable').find('tbody');
    var $categoryExpensesAjaxSpinner = $('.admin-categoryExpenses-table-ajax-spinner');
    var $startInput = $('#categoryStartDate');
    var $endInput = $('#categoryEndDate');
    var $datePickerBtn = $('.vgn-date-picker-button');
    var $startDateSummary = $('.start-date-summary');
    var $endDateSummary = $('.end-date-summary');
    var $totalAmountSummary = $('.total-amount-summary');
    var $summaryInfoTable = $('.profile-table');

    var categoryName = $categoryExpensesTableBody.attr('data-category-name');

    /*
     * -------------------------
     *      EMIT PAGE LOAD EVENT
     * ------------------------
     */
    app.emit('page.load');


    /*
     * --------------------------
     *      CATEGORY EXPENSES PAGE
     * --------------------------
     */
    function buildCategoryExpensesTable () {
        var start = $startInput.val();
        var end = $endInput.val();
        var queryString = '?start=' + start + '&end=' + end;
        $.ajax({
            url: '/cost/api/admin/categories/' + categoryName + "/expenses" + queryString,
            method: 'get',
            beforeSend: categoryExpensesTableAjaxInProgress
        }).done(function (response) {
            categoryExpensesTableAjaxEnded(response);
        });
    }

    function categoryExpensesTableAjaxInProgress () {
        $categoryExpensesAjaxSpinner.show();
        $summaryInfoTable.hide();
    }

    function categoryExpensesTableAjaxEnded (response) {
        // hide the ajax spinner for table
        $categoryExpensesAjaxSpinner.hide();

       // show info table
        $summaryInfoTable.show();

        if (response.success) {
            populateCategoryExpensesTable(response.data);
            app.emit('category.response.success', response.data);
        }
    }

    function populateCategoryExpensesTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push( buildCategoryExpensesTableRow(data[i]) );
        }
        $categoryExpensesTableBody.html(html.join(""));
    }

    function buildCategoryExpensesTableRow (data) {
        if (!data.user) {
            data.user = { name: { first: "", last: "" } };
        }
        var html = categoryExpenseTableRowTemplate.replace('[[color]]', app.helpers.makeRandomColor().color)
            .replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[description]]', data.description)
            .replace('[[amount]]', app.helpers.formatAmount(data.amount) + " " + app.helpers.currencySymbol)
            .replace('[[username]]', data.user.name.first + " " + data.user.name.last)
            .replace('[[title]]', data.title);
        return html;
    }


    /*
     * ------------------------
     *      BUILD SUMMARY TABLE
     * ------------------------
     */
    function buildSummaryTable (data) {
        $startDateSummary.html( app.helpers.formatDate( $startInput.val() ) );
        $endDateSummary.html( app.helpers.formatDate( $endInput.val() ) );
        var total = 0;
        for (var i = 0, len = data.length; i < len; i++) {
            total += data[i].amount;
        }
        $totalAmountSummary.html( app.helpers.formatAmount(total) + " " + app.helpers.currencySymbol);
    }

    /*
     * --------------------
     *      DATE PICKER FORM
     * --------------------
     */
    $datePickerBtn.on('click', function (e) {
        e.preventDefault();
        app.emitEvent('search.button.click');
    });
});