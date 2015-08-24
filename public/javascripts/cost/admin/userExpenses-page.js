$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildUserExpensesTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var rowTemplate = $('#expensesTableTemplate').html();
    var $userExpensesTableBody = $('.user-expenses-table').find('tbody');
    var $userExpensesTableAjaxSpinner = $('.user-expenses-table-ajax-spinner');

    var categoryColors = {};

    /*
     * ---------------------------------------------
     *     PAGE LOAD EVENT
     * ---------------------------------------------
     */
    app.emit('page.load');


    /*
     * ---------------------------------------------
     *     EXPENSE TABLE
     * ---------------------------------------------
     */
    function buildUserExpensesTable () {
        var userId = $userExpensesTableBody.attr('data-expenses-owner-id');
        $.ajax({
            url: '/cost/api/admin/users/' + userId + '/expenses',
            method: 'get',
            beforeSend: userExpensesTableAjaxInProgress
        }).done(function (response) {
            userExpensesTableAjaxEnded(response);
        });
    }

    function populateUserExpensesTable (data) {
        for (var i = 0, len = data.length; i < len; i++) {
            $userExpensesTableBody.append(buildSingleExpense(data[i]));
        }

        $('[data-toggle=popover]').popover({
            placement: 'auto bottom',
            template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title" style="letter-spacing: 1px;"></h3><div class="popover-content"</div></div>',
            title: 'Expense Description',
            content: 'No Description',
            trigger: 'hover click'
        });
    }

    function buildSingleExpense (data) {
        var css;
        if (categoryColors[data.category.name]) {
            css = categoryColors[data.category.name];
        }
        else {
            css = categoryColors[data.category.name] = app.helpers.makeRandomColor();
        }
        var html = rowTemplate.replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[description]]', data.description)
            .replace('[[color]]', css.color)
            .replace('[[title]]', data.title)
            .replace('[[categoryName]]', data.category.name)
            .replace('[[amount]]', app.helpers.formatAmount(data.amount));
        return html;
    }

    function userExpensesTableAjaxInProgress () {
        $userExpensesTableAjaxSpinner.show();
    }

    function userExpensesTableAjaxEnded (response) {
        // hide the spinner
        $userExpensesTableAjaxSpinner.hide();

        if (response.success) {
            populateUserExpensesTable(response.data);
            var totalExpenses = computeTotalAmount(response.data);
            populateTotalExpenses(totalExpenses);
        }
    }

    function computeTotalAmount (data) {
        var total = 0;
        data.forEach(function (elem, i) {
            total += elem.amount;
        });
        return total;
    }

    function populateTotalExpenses (total) {
        $('.user-expenses-total-amount').html(app.helpers.formatAmount(total) + " &#65020;").css({ color: 'red' });
    }
});