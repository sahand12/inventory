$(function () {

    app.addListener('page.load', buildLatestBalanceTable);
    app.addListener('form.create.category.success', buildLatestBalanceTable);

    app.emitEvent('page.load');

    /**
     * ---------------------------------------
     *     GLOBALS
     * ---------------------------------------
     */
    var $latestBalanceTBody = $('#latestBalanceTable'),
        $createCategoryForm = $('#createCategoryForm');

     /**
     * ---------------------------------------
     *     CREATE CATEGORY FORM
     * ---------------------------------------
     */
    $createCategoryForm.on('submit', function (e) {
        // prevent the default behavior
        e.preventDefault();

        var data = {
            categoryName: $('#categoryName').val(),
            categoryAmount: $('#categoryAmount').val()
        };
        console.log(data);
        ajaxCreateCategory(data);
    });

    function ajaxCreateCategory (data) {
        $.ajax({
            url: '/cost/api/categories',
            method: 'post',
            data: data
        }).done(function (response) {
            if (response.success) {
                app.emit('form.create.category.success');
            }
            console.log(response);
        });
    }

    /**
     * ---------------------------------------
     *     BUILD LATEST BALANCE TABLE
     * ---------------------------------------
     */
    function buildLatestBalanceTable () {
        // first empty the table
        $latestBalanceTBody.empty();

        // make the ajax request to fetch the data
        latestTableAjax();
    }

    function latestTableAjax () {
        $.ajax({
            method: "get",
            url: "/cost/api/categories?count=5"
        }).done(function (response) {
            var html = makeTableHtml(response.data);
            $latestTableBody.append(html);
        });
    }

    function makeTableHtml (data) {
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            html += "<tr class='row'><td class='table-left-color'></td><td class=''>" +
                    data[i].name + "</td><td class='cost-table-amount'>$" + app.helpers.formatAmount(data[i].amount) + "</td></tr>";
        }
        return html;
    }
});