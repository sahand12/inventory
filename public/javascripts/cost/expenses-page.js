$(function () {

    app.addListener('page.load', buildExpenseTable);
    app.addListener('page.load', buildTotalExpensesPieChart);
    app.addListener('expense.form.submit.success', buildExpenseTable);
    app.addListener('expense.form.submit.success', buildTotalExpensesPieChart);

    app.emitEvent('page.load');

    app.expensesPageData = {};

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
            app.expensesPageData.table = reformatTableData(response.data);
            populateExpensesTable(response.data);
        });
    }

    function reformatTableData (data) {
        var formatted = {};
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            formatted[current._id] = current;
        }
        return formatted;
    }

    function populateExpensesTable (data) {
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            html += "<tr><td class='category-color'><input class='docId' type='hidden' value='" + current._id + "'/></td><td><span class='fa fa-file-text-o pull-right'></span></td>" +
                "<td>" + app.helpers.formatDate(current.date) + "</td>" +
                "<td>" + current.title + "</td>" +
                "<td class='text-capitalize'>" + current.category.name + "</td>" +
                "<td class='expense-table-amount'>$" + app.helpers.formatAmount(current.amount) + "</td>" +
                "<td><a data-toggle='modal' class='editTd' data-target='#editExpenseModal' href='#'><span class='fa fa-edit expense-item-edit'></span></a></td>" +
                "</tr>";
        }
        //console.log(data);
        $expensesTableBody.html(html);
    }



    /*
     * ---------------------------------------------
     *     EXPENSE PIE CHART
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
        app.expensesPageData.categories = Object.keys(response.data);
        var sortedData = app.helpers.sortPieChartAjaxResponseByAmount(response.data);
        var totalExpensesAmount = app.helpers.calculateTotalExpensesAmount(sortedData);
        $totalExpensesAmount.html("$" + app.helpers.formatAmount(totalExpensesAmount));
        var pieData = app.helpers.formatSortedAjaxDataForPieChart(sortedData);
        app.helpers.drawPieChart(totalPieChartCtx, pieData);
        var statData = app.helpers.formatPieDataForStatistics(pieData);
        app.helpers.showPieChartStats($totalPieChartStats, statData);
    }


    /**
     * ------------------------------------------------
     *     UPDATE / DELETE MODAL
     * ------------------------------------------------
     */
    var $expensesTable = $('#expensesTable'),
        $editExpenseModal = $('#editExpenseModal'),
        $editExpenseForm = $('#editExpenseForm');

    $editExpenseModal.on('shown.bs.modal', function (e){
        populateEditExpenseForm(e.relatedTarget);
    });

    function populateEditExpenseForm (relatedTarget) {
        app.helpers.populateSelectCategory(app.expensesPageData.categories, $editExpenseForm.find('select'));
        var docId = $(relatedTarget).closest('tr').find('.docId').val(),
            activeDoc = app.expensesPageData.table[docId];

        console.log(activeDoc);
        $editExpenseForm.find("#editInputTitle").val(activeDoc.title);
        $editExpenseForm.find('#editInputAmount').val(activeDoc.amount);
        $editExpenseForm.find('#editInputCategory').val(activeDoc.category.name);
        $editExpenseForm.find('#editInputDate').val(app.helpers.formatDateForInput(activeDoc.date));
        $editExpenseForm.find('#editInputDescription').html(activeDoc.description);
    }



});