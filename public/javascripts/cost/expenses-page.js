$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildExpenseTable);
    app.addListener('page.load', buildTotalExpensesPieChart);
    app.addListener('expense.form.submit.success', buildExpenseTable);
    app.addListener('expense.form.submit.success', buildTotalExpensesPieChart);
    app.addListener('update.expense.success', buildExpenseTable);
    app.addListener('update.expense.success', buildTotalExpensesPieChart);
    app.addListener('delete.expense.success', buildExpenseTable);
    app.addListener('delete.expense.success', buildTotalExpensesPieChart);

    app.addListener('expense.pagination', buildExpenseTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var $expensesTableBody = $('#expensesTableBody'),
        $expensesTable = $('#expensesTable'),
        $tableAjaxSpinner = $('.expenses-table-ajax-spinner'),
        $editExpenseAjaxSpinner = $('.edit-expense-ajax-spinner'),
        $tableNoData = $('.expenses-table-no-data'),
        totalPieChartCtx = document.getElementById('totalExpensesPieChart').getContext('2d'),
        $totalExpensesWidget = $('.total-expenses-widget'),
        $totalPieChartStats = $('#totalPieChartStats'),
        $totalExpensesAjaxSpinner = $('.total-expense-ajax-spinner'),
        $totalExpensesAmount = $('#totalExpensesAmount'),
        $paginationContainer = $('#paginationContainer'),
        $completeExpense = $('.complete-expense').find('span');

    var categoryColors = {};


    /*
     * ----------------------------------------------
     *      GLOBAL SINGLETON
     * ----------------------------------------------
     */
    app.expensesPageData = {};

    /*
     * -----------------------------------------------
     *      EMIT PAGE LOAD EVENT
     * -----------------------------------------------
     */
    app.emitEvent('page.load');


    /*
     * ---------------------------------------------
     *     EXPENSE TABLE
     * ---------------------------------------------
     */
    function buildExpenseTable() {
        var page = app.pageNumber || 1;

        // reset the app.pageNumber property
        app.pageNumber = undefined;
        $.ajax({
            method: 'get',
            url: "/cost/api/expenses/list?page=" + page,
            beforeSend: tableAjaxInProgress
        }).done(function (response) {
            // hide the spinner
            tableAjaxEnded();

            app.expensesPageData.table = reformatTableData(response.data.data, categoryColors);
            populateExpensesTable(response.data.data);

            // now build the pagination
            buildPagination(response.data.pages);
        });
    }

    function tableAjaxInProgress() {
        // empty the table <tbody>
        $expensesTableBody.html("");

        // remove pagination
        $paginationContainer.html("");

        // show the spinner
        $tableAjaxSpinner.show();
    }

    function tableAjaxEnded() {
        // hide the spinner
        $tableAjaxSpinner.hide();
    }

    function reformatTableData(data, categoryColors) {
        var formatted = {};
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];

            if (typeof categoryColors[current.category.name]  === 'undefined') {
                var css = app.helpers.makeRandomColor();
                categoryColors[current.category.name] = { color: css.color, highlight: css.highlight };
            }

            formatted[current._id] = current;
        }
        return formatted;
    }

    function populateExpensesTable (data) {
        var html = [];
        var rowTemplate = $('#expensesTableTemplate').text();
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            var rowHtml = rowTemplate;

            rowHtml = rowHtml.replace('[[color]]', categoryColors[current.category.name].color)
                .replace('[[id]]', current._id)
                .replace('[[description]]', current.description)
                .replace('[[date]]', app.helpers.formatDate(current.date))
                .replace('[[title]]', current.title)
                .replace('[[categoryName]]', current.category.name)
                .replace('[[amount]]', app.helpers.formatAmount(current.amount));
            html.push(rowHtml);
        }
        $expensesTableBody.html(html.join(""));

        $('[data-toggle=popover]').popover({
            placement: 'auto bottom',
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title" style="letter-spacing: 1px;"></h3><div class="popover-content"></div></div>',
            title: 'Expense Description',
            content: 'No description',
            trigger: 'hover click'
        });
    }

    function buildPagination (pagesData) {
        if (pagesData.total <= 1) return;

        var leftDisabled = (pagesData.hasPrev ? false : true),
            rightDisabled = (pagesData.hasNext ? false : true);

        var paginationHtml = "<nav class='text-center'><ul class='pagination'>" +
            "<li data-page='" + pagesData.prev + "' " + (leftDisabled ? "class='disabled'": "") + "><a href='#' aria-label='Previous'><span><span aria-hidden='true'>&laquo;</span></span></a></li>";

        for (var i = 1; i <= pagesData.total; i++) {
            paginationHtml += "<li data-page='" + i + "' " + ((pagesData.current === i) ? "class='active'" : "") + "><a href='#'>" + i + "</li>";
        }
        paginationHtml += "<li data-page='" + pagesData.next + "' " + (rightDisabled ? "class='disabled'": "") + "><a href='#' aria-label='Next'><span><span aria-hidden='true'>&raquo;</span></span></a></li>" + "</ul></nav>";


        $paginationContainer.html(paginationHtml);

    }


    /*
     * -----------------------------------------
     *      PAGINATION CLICK EVENTS
     * -----------------------------------------
     */
    $paginationContainer.on('click', function (e) {
        e.preventDefault();

        var target = $(e.target.closest('li')),
            isTargetActive = target.hasClass('active'),
            isTargetDisabled = target.hasClass('disabled');

        if (!isTargetActive && !isTargetDisabled) {
            app.pageNumber = target.attr('data-page');
            app.emit('expense.pagination');

            // remove pagination from dom
            $('.pagination').remove();
        }

    });


    /*
     * ---------------------------------------------
     *     EXPENSE PIE CHART
     * ---------------------------------------------
     */
    function buildTotalExpensesPieChart() {
        // get the data from the server for total expenses pie-chart
        $.ajax({
            method: "get",
            url: "/cost/api/expenses/categories/total",
            beforeSend: totalExpenseAjaxInProgress
        }).done(function (response) {
            // hide the spinner
            totalExpensesAjaxEnded();
            populateTotalExpensesPieChart(response, categoryColors);
        });
    }

    function totalExpenseAjaxInProgress() {
        // hide the sidebar contents
        $totalExpensesWidget.hide();

        // show the spinner
        $totalExpensesAjaxSpinner.show();
    }

    function totalExpensesAjaxEnded () {
        // show the total expenses widget
        $totalExpensesWidget.show();

        // hide the spinner
        $totalExpensesAjaxSpinner.hide();
    }

    function populateTotalExpensesPieChart(response, categoryColors) {
        app.expensesPageData.categories = Object.keys(response.data);
        var sortedData = app.helpers.sortPieChartAjaxResponseByAmount(response.data);
        var totalExpensesAmount = app.helpers.calculateTotalExpensesAmount(sortedData);
        $totalExpensesAmount.html(app.helpers.formatAmount(totalExpensesAmount) + " &#65020;");
        var pieData = app.helpers.formatSortedAjaxDataForPieChart(sortedData, categoryColors);
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

    $editExpenseModal.on('shown.bs.modal', function (e) {
        // delete any pre populated form errors
        app.helpers.emptyFormErrors($('.form-group'), $('.cost-form-error-item'), $('.cost-form-error-head'));

        // hide the ajax spinner
        $editExpenseAjaxSpinner.hide();

        // e.relatedTarget points to the <a> which triggered showing the modal
        populateEditExpenseForm(e.relatedTarget);

    });

    function populateEditExpenseForm(relatedTarget) {
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

    function makePutRequestToServer(e) {
        // preventing the default action
        e.preventDefault();

        // format the data and make it ready for server
        var data = formatDataForPutRequest($editExpenseForm);

        // send the data to the server
        editExpenseAjax(data);
    }

    function editExpenseAjax(data) {
        $.ajax({
            method: 'put',
            url: '/cost/api/expenses',
            data: data,
            beforeSend: editExpenseAjaxInProgress
        }).done(function (response) {
            // hide the spinner
            editExpenseAjaxEnded();

            handleEditResponseFromServer(response);
        });
    }

    function editExpenseAjaxInProgress() {
        $editExpenseAjaxSpinner.show();
    }

    function editExpenseAjaxEnded () {
        $editExpenseAjaxSpinner.hide();
    }

    function handleEditResponseFromServer(response) {
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

    function showUpdateErrorsFromServer(response) {
        var validationErrors = response.validationErrors,
            postErrors = response.postErrors;

        if (validationErrors) {
            for (var err in validationErrors) {
                if (validationErrors.hasOwnProperty(err)) {
                    var inputId = '#editInput' + app.helpers.capitalizeFirstLetter(err),
                        $formGroupWithError = $(inputId).closest('.form-group'),
                        $errorDesc = $formGroupWithError.find('.cost-form-error-item');

                    $formGroupWithError.addClass('has-error');
                    $errorDesc.html("&bull; " + validationErrors[err].msg);
                }
            }
        }

        if (postErrors) {
            $('cost-form-error-head').html('<p class="alert alert-danger">An error happened during form submission. Please try again.</p>');
        }
    }

    function formatDataForPutRequest($form) {
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

    function makeDeleteRequestToServer(e) {
        // preventing the default action
        e.preventDefault();

        // the id of the record to be deleted
        var expenseId = $editExpenseForm.find("#editInputId").val();

        // send the data to the server
        deleteExpenseAjax(expenseId);
    }

    function deleteExpenseAjax(id) {
        $.ajax({
            method: 'delete',
            url: '/cost/api/expenses',
            data: {
                _id: id
            },
            beforeSend: editExpenseAjaxInProgress
        }).done(function (response) {
            // hide the spinner
            editExpenseAjaxEnded();

            handleEditResponseFromServer(response);
        });
    }

    function handleDeleteResponseFromServer(response) {
        if (!response.success) {
            showDeleteErrorsFromServer(response);
        }

        // we had a successful delete so lets hide the modal now
        $editExpenseModal.modal('hide');

        // take care of updating the page
        app.emit('delete.expense.success');
    }

    function showDeleteErrorsFromServer(response) {
        //console.log(response);
    }


    /*
     * --------------------------
     *     SHOW DESCRIPTION ON CLICK USING A POPOVER
     * -------------------------
     */


});