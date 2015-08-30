// public/javascripts/cost/admin/expenses-page.js
$(function () {

    /*
     * -----------------------
     *      EVENT LISTENERS
     * -----------------------
     */
    app.addListener('page.load', buildAdminExpensesTable);
    app.addListener('page.load', buildAdminTotalExpensesPieChart);
    app.addListener('expense.form.submit.success', buildAdminExpensesTable);
    app.addListener('expense.form.submit.success', buildAdminTotalExpensesPieChart);
    app.addListener('expense.pagination', buildAdminExpensesTable);

    app.addListener('expense.form.submit.success', buildAdminExpensesTable);
    app.addListener('expense.form.submit.success', buildAdminTotalExpensesPieChart);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var $adminExpensesTableBody = $('#adminExpensesTable').find('tbody');
    var $adminExpensesTableAjaxSpinner = $('.admin-all-expenses-table-ajax-spinner');
    var totalPieChartCtx = $('#adminTotalExpensesPieChart')[0].getContext('2d');
    var $totalExpensesWidget = $('.total-expenses-widget');
    var $totalPieChartStats = $('#totalPieChartStats');
    var $totalExpensesAjaxSpinner = $('.admin-total-expenses-ajax-spinner');
    var $totalExpensesAmount = $('#totalExpensesAmount');
    var $paginationContainer = $('#paginationContainer');
    var paginationBodyTemplate = $('#paginationBody').html();
    var paginationItemTemplate = $('#paginationItem').html();

    var adminExpensesTableTemplate = $('#adminExpensesTableTemplate').html();

    var categoryColors = {};


    /*
     * ---------------------------
     *     GLOBAL SINGLETON
     * ---------------------------
     */
    app.adminExpensesPageData = {};


    /*
     * ---------------------
     *     EMIT PAGE LOAD EVENT
     * ---------------------
     */
    app.emitEvent('page.load');


    /*
     * ----------------------------
     *     ADMIN EXPENSES TABLE
     * ---------------------------
     */
    function buildAdminExpensesTable () {
        var page = app.pageNumber || 1;

        // Reset app.pageNumber
        app.pageNumber = undefined;
        $.ajax({
            method: 'get',
            url: '/cost/api/admin/expenses?limit=10&page=' + page,
            beforeSend: adminExpensesTableAjaxInProgress
        }).done(function (response) {
            setTimeout(function () {
                adminExpensesTableAjaxEnded(response);
            }, 1000);
        });
    }

    function adminExpensesTableAjaxInProgress () {
        // empty the table <tbody>
        $adminExpensesTableBody.html("");

        // Remove pagination
        $paginationContainer.html("");

        // Show the spinner
        $adminExpensesTableAjaxSpinner.show();
    }

    function adminExpensesTableAjaxEnded (response) {
        // hide the spinner
        $adminExpensesTableAjaxSpinner.hide();

        app.adminExpensesPageData = reformatTableData(response.data.data, categoryColors);
        populateAdminExpensesTable(response.data.data);
        buildPagination(response.data.pages);
    }

    function reformatTableData (data, categoryColors) {
        var formatted = {};
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            if (typeof categoryColors[current.category.name] === 'undefined') {
                var css = app.helpers.makeRandomColor();
                categoryColors[current.category.name] = { color: css.color, highlight: css.highlight };
            }
            formatted[current._id] = current;
        }
        return formatted;
    }

    function populateAdminExpensesTable (data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            html.push( buildAdminExpensesTableRow(data[i]) );
        }
        $adminExpensesTableBody.html( html.join("") );

        $('[data-toggle=popover]').popover({
            placement: 'auto bottom',
            template: '<div class="popover" role="tooltip"><div class="row"></div><h3 class="popover-title" style="letter-spacing: 1px;"></h3><div class="popover-content"></div></div>',
            title: 'Expense Description',
            content: 'No Description',
            trigger: 'hover click'
        });
    }

    function buildAdminExpensesTableRow (data) {
        if (!data.user) {
            data.user = { name: { first: "", last: "" } };
        }
        var html = adminExpensesTableTemplate.replace('[[color]]', categoryColors[data.category.name].color)
            .replace('[[id]]', data._id)
            .replace('[[description]]', data.description)
            .replace('[[date]]', app.helpers.formatDate(data.date))
            .replace('[[title]]', data.title)
            .replace('[[username]]', data.user.name.first + " " + data.user.name.last)
            .replace('[[categoryName]]', data.category.name)
            .replace('[[amount]]', app.helpers.formatAmount(data.amount) + " " + app.helpers.currencySymbol);
        return html;
    }

    function buildPagination (pagesData) {
        if (pagesData.total <= 1) return;

        var paginationBodyHtml = buildPaginationBody(pagesData);
        var paginationItemsHtml = buildPaginationItems(pagesData);
        var $paginationBodyHtml = $(paginationBodyHtml);
        var $paginationItemsHtml = $(paginationItemsHtml);

        $paginationBodyHtml.find('#paginationPrevBtn').after($paginationItemsHtml);
        $paginationContainer.html($paginationBodyHtml);
    }

    function buildPaginationBody (pagesData) {
        var leftDisabled = (pagesData.hasPrev ? "" : "class='disabled'");
        var rightDisabled = (pagesData.hasNext ? "" : "class='disabled'");
        var paginationHtml = paginationBodyTemplate.replace('[[prev]]', pagesData.prev)
            .replace('[[leftDisabled]]', leftDisabled)
            .replace('[[rightDisabled]]', rightDisabled)
            .replace('[[next]]', pagesData.next);
        return paginationHtml;
    }

    function buildPaginationItems (pagesData) {
        var html = [];
        var pagePattern = /\[\[index]]/g;
        var curPattern = '[[current]]';
        var disablePattern = '[[disabled]]';
        console.log(pagesData);
        if (pagesData.total < 5) {
            for (var i = 1, len = pagesData.total; i <= len; i++) {
                var temp = paginationItemTemplate.replace(pagePattern, i);
                 temp = i === pagesData.current ?
                     temp.replace('[[current]]', 'class="active"') :
                     temp.replace('[[current]]', "");
                html.push(temp);
            }
            return html.join("");
        }
        else {
            var first, last;
            var current = "";
            var next = "";
            var nextNext = "";
            var prev = "";
            var prevPrev = "";

            first = paginationItemTemplate.replace(pagePattern, 1).replace(disablePattern, "");
            first = addActiveClass(first, pagesData.current, 1);

            last = paginationItemTemplate.replace(pagePattern, pagesData.total).replace(disablePattern, "");
            last = addActiveClass(last, pagesData.current, pagesData.total);

            if (pagesData.current !== 1 && pagesData.current !== pagesData.total) {
                current = paginationItemTemplate.replace(pagePattern, pagesData.current)
                    .replace(curPattern, 'class="active"');
            }
            if (pagesData.hasNext && pagesData.next !== pagesData.total) {
                next = paginationItemTemplate.replace(pagePattern, pagesData.next)
                    .replace(curPattern, "").replace(disablePattern, "");
                if (pagesData.next !== (pagesData.total - 1) ) {
                    nextNext = paginationItemTemplate.replace(pagePattern, '...')
                        .replace(curPattern, "")
                        .replace(disablePattern, "class='disabled'");
                }
            }
            if (pagesData.hasPrev && pagesData.prev !== 1) {
                prev = paginationItemTemplate.replace(pagePattern, pagesData.prev).replace(curPattern, "");
                if (pagesData.prev !== 2) {
                     prevPrev = paginationItemTemplate.replace(pagePattern, "...")
                         .replace(curPattern, "")
                         .replace(disablePattern, "class='disabled'");
                }
            }
            html.push(first, prevPrev, prev, current, next, nextNext, last);
            return html.join("");
        }
    }

    function addActiveClass (template, current, index) {
        var temp = index === current ?
            template.replace('[[current]]', 'class="active"') :
            template.replace('[[current]]', "");
        return temp;
    }


    /*
     * ------------------------------
     *     PAGINATION CLICK EVENTS
     * ------------------------------
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
    });

    /*
     * --------------------------
     *      TOTAL EXPENSE PIE CHART
     * --------------------------
     */
    function buildAdminTotalExpensesPieChart() {
        // Get the data form the server for total expenses
        $.ajax({
            method: 'get',
            url: '/cost/api/admin/categories/expenses/total',
            beforeSend: adminTotalExpensesPieChartAjaxInProgress
        }).done(function (response) {
            setTimeout(function () {
                adminTotalExpensesPieChartAjaxEnded(response);
            }, 1000);
        });
    }

    function adminTotalExpensesPieChartAjaxInProgress () {
        // show the ajax spinner
        $totalExpensesAjaxSpinner.show();
        $totalExpensesWidget.hide();
    }

    function adminTotalExpensesPieChartAjaxEnded (response) {
        console.log(response);
        // hide the ajax spinner
        $totalExpensesAjaxSpinner.hide();
        $totalExpensesWidget.show();
        var pieData = populateTotalExpensesPieChart(response, categoryColors);
        showAdminPieChartStats(pieData);
    }

    function populateTotalExpensesPieChart (response, categoryColors) {
        console.log('pie chart', response);
        var pieData = [];
        app.adminExpensesPageData.total = 0;
        for (var i = 0, len = response.data.length; i < len; i++) {
            var current = response.data[i];
            if (!categoryColors[current._id.name]) {
                var css = app.helpers.makeRandomColor();
                categoryColors[current._id.name] = { color: css.color, highlight: css.highligh }
            }
            pieData.push({
                value: current.total,
                label: current._id.name,
                color: categoryColors[current._id.name].color,
                highlight: categoryColors[current._id.name].highlight
            });
            app.adminExpensesPageData.total += current.total;
        }
        new Chart(totalPieChartCtx).Pie(pieData, { responsive: true, segmentShowStroke: false });
        $totalExpensesAmount.html(app.helpers.formatAmount( app.adminExpensesPageData.total) + " " + app.helpers.currencySymbol);

        return pieData;
    }

    function showAdminPieChartStats (data) {
        app.adminExpensesPageData.statsData = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            app.adminExpensesPageData.statsData.push({
                name: current.label,
                color: categoryColors[current.label].color,
                percent: ( 100 * (current.value / app.adminExpensesPageData.total ) ).toFixed(2)
            });
        }

        $totalPieChartStats.empty();
        var html = "";
        for (i = 0; i < len; i++) {
            current = app.adminExpensesPageData.statsData[i];
            html += "<div class='pie-chart-stat-item'>" +
            "<span class='square-block pull-left' style='background: " + current.color + "'></span>" +
            "<p class='pull-left text-capitalize'><strong>" + current.name + "</strong> &nbsp;" + current.percent + "%</p>" +
            "</div>";
        }
        $totalPieChartStats.html(html);
    }

});
