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
        var userId = $userExpensesTableBody.attr('data-user-id');
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
    }

    function buildSingleExpense (data) {
        var html = rowTemplate.replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[color]]', app.helpers.makeRandomColor().color)
            .replace('[[title]]', data.title)
            .replace('[[categoryName]]', data.category.name)
            .replace('[[amount]]', app.helpers.formatAmount(data.amount));
        return html;
    }

    function userExpensesTableAjaxInProgress () {

    }

    function userExpensesTableAjaxEnded (response) {
        console.log(response);
        if (response.success) {
            populateUserExpensesTable(response.data);
        }
    }
});