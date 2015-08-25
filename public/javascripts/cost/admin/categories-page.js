$(function () {

    /*
     * ----------------------------
     *      EVENT LISTENERS
     * ----------------------------
     */
    app.addListener('page.load', buildAdminCategoriesTable);
    app.addListener('search.button.click', buildAdminCategoriesTable);
    app.addListener('expense.form.submit.success', buildAdminCategoriesTable);
    app.addListener('category.response.success', buildSummaryTable);


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
    var $startDateSummary = $('.start-date-summary');
    var $endDateSummary = $('.end-date-summary');
    var $totalAmountSummary = $('.total-amount-summary');

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
            populateAdminCategoriesTable(response.data);
            buildAdminCategoryBarChart(response.data);
            app.emit('category.response.success', response.data);
        }
    }

    function populateAdminCategoriesTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push( buildAdminCategoryTableRow(data[i]) );
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


    /*
     * ----------------------------
     *      CATEGORIES BAR CHART
     * ----------------------------
     */
    function buildAdminCategoryBarChart (data) {
        var canvas = $('<canvas class="barChart" id="barChart"></canvas>');
        var context = canvas.get(0).getContext('2d');
        $barChartContainer.html(canvas);

        var barData = {};
        barData.labels = [];
        barData.datasets = [{
            label: 'Category Amount',
            fillColor: "rgb(155, 213, 203)",
            strokeColor: "rgba(155, 213, 203, 0.8)",
            highlightFill: "rgba(155, 213, 203, 0.75)",
            highlightStroke: "rgba(155, 213, 203, 1)"
        }];
        var catData = barData.datasets[0].data = [];
        //console.log(barData.datasets[0]);
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            barData.labels.push(current._id.name);
            catData.push(current.total);
        }
        //console.log(barData);
        new Chart(context).Bar(barData, { responsive: true, barValueSpacing: 20 });
    }


    /*
     * -------------------------------
     *     BUILD SUMMARY TABLE
     * -------------------------------
     */
    function buildSummaryTable (data) {
        console.log($startInput.val(), $endInput.val());
        $startDateSummary.html(app.helpers.formatDate($startInput.val()));
        $endDateSummary.html(app.helpers.formatDate($endInput.val()));
        var total = 0;
        for (var i = 0, len = data.length; i < len; i++) {
            total += data[i].total;
        }
        $totalAmountSummary.html(app.helpers.formatAmount(total) + " " + app.helpers.currencySymbol);
    }


    /*
     * ----------------------------
     *     DATE PICKER FORM
     * ----------------------------
     */
    $datePickerBtn.on('click', handleDatePickerBtnClick);

    function handleDatePickerBtnClick (e) {
        e.preventDefault();
        app.emitEvent('search.button.click');
    }
});

