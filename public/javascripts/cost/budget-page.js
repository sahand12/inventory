$(function () {

    app.addListener('page.load', buildLatestBalanceTable);
    app.addListener('page.load', buildBudgetTable);
    app.addListener('form.create.category.success', buildLatestBalanceTable);
    app.addListener('form.create.category.success', buildBudgetTable);
    app.addListener('expense.form.submit.success', buildLatestBalanceTable);

    /**
     * ---------------------------------------
     *     GLOBALS
     * ---------------------------------------
     */
    var $latestBalanceTBody = $('#latestBalanceTable').find('tbody'),
        $createCategoryForm = $('#createCategoryForm');

    var categoryColors = {};


    /**
     * ---------------------------------------
     *     PAGE LOAD EVENT
     * ---------------------------------------
     */
    app.emit('page.load');

     /**
     * ---------------------------------------
     *     CREATE CATEGORY FORM
     * ---------------------------------------
     */
    $createCategoryForm.on('submit', function (e) {
        // prevent the default behavior
        e.preventDefault();

        var data = {
            categoryName: $('#categoryName').val().trim(),
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
                $('#categoryName').val("");
                $('#categoryAmount').val("");
            }

            // TODO
            // handle the response that got back from the server
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
            url: "/cost/api/expenses?count=5"
        }).done(function (response) {
            console.log(response);
            if (response.success) {
                var html = makeTableHtml(response.data);
                $latestBalanceTBody.append(html);
            }
        });
    }

    function makeTableHtml (data) {
        var html = "",
            current;
        for (var i = 0, len = data.length; i < len; i++) {
             current = data[i];

            // make the category color
            if (typeof categoryColors[current.category.name] === 'undefined') {
                categoryColors[current.category.name] = app.helpers.makeRandomColor()['color'];
            }

            html += "<tr class='row'><td style='background-color:" + categoryColors[current.category.name] + ";'></td><td class='text-capitalize'>" +
                    current.category.name + "</td><td class='cost-table-amount'>$" + app.helpers.formatAmount(current.amount) + "</td></tr>";
        }
        return html;
    }

    /**
     * ----------------------------------------
     *     BUILD THE BUDGET TABLE
     * ----------------------------------------
     */
    function buildBudgetTable () {
        // get the data from the server
        $.ajax({
            method: "get",
            url: "/cost/api/categories/latest?count=100"   // we assume that nobody's gonna have more that 100 category
        }).done(function (response){
            if (response.success) {
                populateBudgetTable(response.data, addBudgetTableToDom);
            }
        });
    }

    function populateBudgetTable (data, done) {
        var html = "",
            current;
        for (var i = 0, len = data.length; i < len; i++) {
            current = data[i];

            // make the category color
            if (typeof categoryColors[current.name] === 'undefined') {
                categoryColors[current.name] = app.helpers.makeRandomColor()['color'];
            }

            html += "<tr><td style='background-color:" + categoryColors[current.name] + ";'></td><td class='text-capitalize'>"
            + current.name + "</td><td>$" + app.helpers.formatAmount(current.amount) + "</td>"
            + "<td><span class=\"fa fa-edit\"></span></td></tr>";
        }
        return done(html);
    }

    function addBudgetTableToDom (html) {
        $('#categoryBudgetTable').find('tbody').html(html);
    }

});
































