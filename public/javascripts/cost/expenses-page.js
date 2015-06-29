$(function () {

    app.addListener('page.load', buildExpenseTable);
    app.addListener('page.load', buildTotalExpensesPieChart);
    app.addListener('expense.form.submit.success', buildExpenseTable);
    app.addListener('expense.form.submit.success', buildTotalExpensesPieChart);
    app.addListener('update.expense.success', buildExpenseTable);
    app.addListener('update.expense.success', buildTotalExpensesPieChart);
    app.addListener('delete.expense.success', buildExpenseTable);
    app.addListener('delete.expense.success', buildTotalExpensesPieChart);

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
     *     UPDATE / DELETE MODAL FORM POPULATION
     * ------------------------------------------------
     */
    var $editExpenseModal = $('#editExpenseModal'),
        $editExpenseForm = $('#editExpenseForm');

    $editExpenseModal.on('shown.bs.modal', function (e){
        // delete any pre populated form errors
        app.helpers.emptyFormErrors($('.form-group'), $('.cost-form-error-item'), $('.cost-form-error-head'));

        // e.relatedTarget points to the <a> which triggered showing the modal
        populateEditExpenseForm(e.relatedTarget);

    });

    function populateEditExpenseForm (relatedTarget) {
        app.helpers.populateSelectCategory(app.expensesPageData.categories, $editExpenseForm.find('select'));
        var docId = $(relatedTarget).closest('tr').find('.docId').val(),
            activeDoc = app.expensesPageData.table[docId];

        $editExpenseForm.find('#editInputId').val(docId);
        $editExpenseForm.find("#editInputTitle").val(activeDoc.title);
        $editExpenseForm.find('#editInputAmount').val(activeDoc.amount);
        $editExpenseForm.find('#editInputCategory').val(activeDoc.category.name);
        $editExpenseForm.find('#editInputDate').val(app.helpers.formatDateForInput(activeDoc.date));
        $editExpenseForm.find('#editInputDescription').html(activeDoc.description);
    }

    /**
     * ------------------------------------------------
     *     UPDATE BUTTON ON EDIT EXPENSE FORM
     * ------------------------------------------------
     */
    var $updateBtn = $('#editExpenseUpdateButton');

    $updateBtn.on('click', function (e) {
       makePutRequestToServer(e);
    });

    function makePutRequestToServer (e) {
        // preventing the default action
        e.preventDefault();

        // format the data and make it ready for server
        var data = formatDataForPutRequest($editExpenseForm);

        // send the data to the server
        editExpenseAjax(data);
    }

    function editExpenseAjax (data) {
        $.ajax({
            method: 'put',
            url: '/cost/api/expenses',
            data: data
        }).done(function (response) {
            handleEditResponseFromServer(response);
        });
    }

    function handleEditResponseFromServer (response) {
        if (!response.success) {
            // first clear the last errors
            app.helpers.emptyFormErrors($('.form-group'), $('.cost-form-error-item'), $('.cost-form-error-head'));

            // show the new errors
            return showUpdateErrorsFromServer(response);
        }

        // we had a successful update so lets hide the modal
        $editExpenseModal.modal('hide');

        // updating the page according to new information
        app.emit('update.expense.success');
    }

    function showUpdateErrorsFromServer (response) {
        var validationErrors = response.validationErrors,
            postErrors = response.postErrors;

        if (validationErrors) {
            for (var err in validationErrors) {
                if (validationErrors.hasOwnProperty(err)) {
                    var inputId = '#editInput' + app.helpers.capitalizeFirstLetter(err),
                        $formGroupWithError = $(inputId).closest('.form-group'),
                        $errorDesc = $formGroupWithError.find('.cost-form-error-item');

                    $formGroupWithError.addClass('has-error');
                    $errorDesc.html( "&bull; " + validationErrors[err].msg);
                }
            }
        }

        if (postErrors) {
            $('cost-form-error-head').html('<p class="alert alert-danger">An error happened during form submission. Please try again.</p>');
        }
    }

    function formatDataForPutRequest ($form) {
        return {
            _id: $form.find('#editInputId').val(),
            title: $form.find('#editInputTitle').val(),
            amount: $form.find('#editInputAmount').val(),
            date: $form.find('#editInputDate').val(),
            category: $form.find('#editInputCategory').val(),
            description: $form.find('#editInputDescription').val()
        };
    }

    /**
     * ------------------------------------------------
     *     DELETE BUTTON ON EDIT EXPENSE FORM
     * ------------------------------------------------
     */
    var $deleteBtn = $('#editExpenseDeleteButton');

    $deleteBtn.on('click', function (e) {
        // prevent the default behaviour
        makeDeleteRequestToServer(e);
    });

    function makeDeleteRequestToServer (e) {
        // preventing the default action
        e.preventDefault();

        // the id of the record to be deleted
        var expenseId = $editExpenseForm.find("#editInputId").val();

        // send the data to the server
        deleteExpenseAjax(expenseId);
    }

    function deleteExpenseAjax (id) {
        $.ajax({
            method: 'delete',
            url: '/cost/api/expenses',
            data : {
                _id: id
            }
        }).done(function (response) {
            console.log(response);
            handleDeleteResponseFromServer(response);
        });
    }

    function handleDeleteResponseFromServer (response) {
        if (!response.success) {
            showDeleteErrorsFromServer(response);
        }

        // we had a successful delete so lets hide the modal now
        $editExpenseModal.modal('hide');

        // take care of updating the page
        app.emit('delete.expense.success');
    }

    function showDeleteErrorsFromServer (response) {
        console.log(response);
    }

});