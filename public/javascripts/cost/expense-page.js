$(function () {

    app.addListener('page.load', buildExpenseTable);
    app.addListener('page.load', buildTotalExpensesPieChart);

    app.emitEvent('page.load');

    /*
     * ---------------------------------------------
     *     EXPENSE TABLE
     * ---------------------------------------------
     */
    var $expensesTableBody = $('#expensesTableBody');

    function buildExpenseTable() {
        // fetch the info from the server
        $.ajax({
            method: 'get',
            url: "/cost/api/expenses?count=10"
        }).done(function (response) {
            populateExpensesTable(response.data);
        });
    }

    function populateExpensesTable (data) {
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            html += "<tr><td class='category-color'></td><td><span class='fa fa-file-text-o pull-right'></span></td>" +
                "<td>" + app.helpers.formatDate(current.date) + "</td>" +
                "<td>" + current.title + "</td>" +
                "<td class='text-capitalize'>" + current.category.name + "</td>" +
                "<td class='expense-table-amount'>$" + app.helpers.formatAmount(current.amount) + "</td>" +
                "<td><a id='editExpenseItem' href='#'><span class='fa fa-edit expense-item-edit'></span></a></td>" +
                "</tr>";
        }
        //console.log(data);
        $expensesTableBody.html(html);
    }



    /*
     * ---------------------------------------------
     *     EXPENSE Pie CHART
     * ---------------------------------------------
     */
    var totalPieChartCtx = document.getElementById('totalExpensesPieChart').getContext('2d'),
        $totalPieChartStats = $('#totalPieChartStats'),
        $totalExpensesAmount = $('#totalExpensesAmount');

    function buildTotalExpensesPieChart () {
        // get the data from the server for total expenses pie-chart
        $.ajax({
            method: "get",
            url: "/cost/api/expenses/categories?days=10000"
        }).done(function (response) {
            populateTotalExpensesPieChart(response);
        });
    }

    function populateTotalExpensesPieChart (response) {
        var sortedData = app.helpers.sortPieChartAjaxResponseByAmount(response.data);
        var totalExpensesAmount = app.helpers.calculateTotalExpensesAmount(sortedData);
        $totalExpensesAmount.html("$" + app.helpers.formatAmount(totalExpensesAmount));
        var pieData = app.helpers.formatSortedAjaxDataForPieChart(sortedData);
        app.helpers.drawPieChart(totalPieChartCtx, pieData);
        var statData = app.helpers.formatPieDataForStatistics(pieData);
        app.helpers.showPieChartStats($totalPieChartStats, statData);
        console.log(totalExpensesAmount, sortedData, pieData, statData);
    }


});