$(function () {

    /*
     * ----------------------------
     *      EVENT LISTENERS
     * ----------------------------
     */
    app.addListener('page.load', buildAdminCategoriesTable);
    app.addListener('search.button.click', buildAdminCategoriesTable);
    app.addListener('expense.form.submit.success', buildAdminCategoriesTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var $adminCategoriesTableBody = $('#adminCategoriesTable').find('tbody');
    var $startInput = $('#categoryStartDate');
    var $endInput = $('#categoryEndDate');
    var $datePickerBtn = $('.vgn-date-picker-button');
    var $barChartContainer = $('#adminCategoriesBarChartContainer');
    var $categoriesTableAjaxSpinner = $('.admin-categories-table-ajax-spinner');
    var $createCategoryAjaxSpinner = $('.admin-createCategories-aja-spinner');

    var adminCategoriesTableRowTemplate = $('#adminCategoriesTableTemplate').html();
    var categoryColors = {};

    /*
     * ----------------------------
     *     EMIT PAGE LOAD EVENT
     * ---------------------------
     */
    app.emit('page.load');


    /*
     * ---------------------------
     *      CATEGORIES TABLE AND BAR CHART
     * ---------------------------
     */
    function buildAdminCategoriesTable () {
        var start = $startInput.val();
        var end = $endInput.val();
        var queryString = '?start=' + start + '&end=' + end;
        $.ajax({
            url: '/cost/api/admin/categories/expenses' + queryString,
            method: 'get',
            beforeSend: adminCategoriesTableAjaxInProgress
        }).done(function (response) {
            adminCategoriesTableAjaxEnded(response);
        });
    }

    function adminCategoriesTableAjaxInProgress () {
        $categoriesTableAjaxSpinner.show();
    }

    function adminCategoriesTableAjaxEnded (response) {
        console.log(response);
        $categoriesTableAjaxSpinner.hide();

        if (response.success) {
            populateAdminCategoriesTable (response.data);
        }
    }

    function populateAdminCategoriesTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push( buildAdminCategoryTableRow(data[i]));
        }
        $adminCategoriesTableBody.html(html.join(""));
    }

    function buildAdminCategoryTableRow (data) {
        var html = adminCategoriesTableRowTemplate.replace('[[color]]', app.helpers.makeRandomColor().color)
            .replace('[[amount]]', app.helpers.formatAmount(data.total) + " " + app.helpers.currencySymbol)
            .replace('[[id]]', data._id.id)
            .replace('[[name]]', data._id.name);
        return html;
    }
});