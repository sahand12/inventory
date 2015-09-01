$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildUserExpensesTable);
    app.addListener('expense.pagination', buildUserExpensesTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var rowTemplate = $('#expensesTableTemplate').html();
    var $userExpensesTableBody = $('.user-expenses-table').find('tbody');
    var $userExpensesTableAjaxSpinner = $('.user-expenses-table-ajax-spinner');
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
     *     SPECIFIC USER EXPENSE TABLE
     * ---------------------------------------------
     */
    function buildUserExpensesTable () {
        var page = app.pageNumber || 1;
        var userId = $userExpensesTableBody.attr('data-expenses-owner-id');

        // Reset app.pageNumber
        app.pageNumber = undefined;
        $.ajax({
            url: '/cost/api/admin/users/' + userId + '/expenses?page=' + page,
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
        // show the spinner
        $userExpensesTableAjaxSpinner.show();

        // Remove Pagination
        $paginationContainer.html("");

        // empty the table <tbody>
        $userExpensesTableBody.html("");
    }

    function userExpensesTableAjaxEnded (response) {
        // hide the spinner
        $userExpensesTableAjaxSpinner.hide();

        if (response.success) {
            console.log(response);
            populateUserExpensesTable(response.data.data);
            var totalExpenses = computeTotalAmount(response.data.data);
            populateTotalExpenses(totalExpenses);
            var $pagination = app.helpers.buildPagination({
                pagesData: response.data.pages,
                bodyTmpl: paginationBodyTemplate,
                itemTmpl: paginationItemTemplate
            });
            $paginationContainer.html($pagination);
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

    /*
     * -------------------------------
     *     PAGINATION CLICK EVENTS
     * -------------------------------
     */
    $paginationContainer.on('click', function (e) {
        e.preventDefault();

        var $target = $(e.target.closest('li'));
        if (!$target.hasClass('active') && !$target.hasClass('disabled')) {
            app.pageNumber = $target.attr('data-page');
            app.emit('expense.pagination');

            // Remove pagination from dom
            $('.pagination').remove();
        }
    })
});