$(function () {

    /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildCategoriesTable);
    app.addListener('search.button.click', buildCategoriesTable);
    app.addListener('expense.form.submit.success', buildCategoriesTable);


    /*
     * -------------------------------
     *      GLOBAL VARIABLES
     * -------------------------------
     */
    var $categoriesTableBody = $('#categoriesTableBody'),
        $startInput = $('#start'),
        $endInput = $('#end'),
        $dateSearchBtn = $('#dateSearchBtn'),
        $barChartContainer = $('#barChartContainer'),
        $tableAjaxSpinner = $('.categories-table-ajax-spinner');

    var categoryColors = {};


    /*
     * -------------------------------
     *      GLOBAL SINGLETON
     * -------------------------------
     */



    /*
     * -------------------------------
     *      EMIT PAGE LOAD EVENT
     * -------------------------------
     */
    app.emitEvent('page.load');


    /*
     * ----------------------------------------
     *      CATEGORIES TABLE AND BAR CHART
     * ----------------------------------------
     */
    function buildCategoriesTable () {

        var startDate = new Date($startInput.val()).valueOf(),
            endDate = new Date($endInput.val()).valueOf(),
            queryString = "?startDate=" + startDate + "&endDate=" + endDate;
console.log(startDate, endDate);
        $.ajax({
            method: 'get',
            url: '/cost/api/expenses/categories' + queryString,
            beforeSend: tableAjaxInProgress
        }).done(function (response) {
            setTimeout(function () {
                console.log(response);
                // Hide the spinner
                tableAjaxEnded();

                populateCategoriesTable(response.data);
                buildCategoriesBarChart(response.data);
            }, 1000);
        });
    }

    function tableAjaxInProgress() {
        // empty the table <tbody>
        $categoriesTableBody.html("");

        // empty the bar chart container
        $barChartContainer.html("");

        // show the spinner
        $tableAjaxSpinner.show();
    }

    function tableAjaxEnded() {
        // hide the spinner
        $tableAjaxSpinner.hide();
    }

    function populateCategoriesTable (data) {
        var html = "";

        for (var name in data) {
            if (data.hasOwnProperty(name)) {
                if (typeof categoryColors[name] === 'undefined') {
                    var css = app.helpers.makeRandomColor();
                    categoryColors[name] = {color: css.color, highlight: css.highlight};
                }

                html += "<tr><td style='background-color: " + categoryColors[name].color + "'></td>" +
                "<td>" + name + "</td>" +
                "<td style='color: red'>" + app.helpers.formatAmount(data[name]) + " &#65020;" + "</td>" +
                "</tr>";
            }
        }

        $categoriesTableBody.html(html);
    }

    /**
     * ----------------------------------
     *     BUILD CATEGORIES BAR CHART
     * ---------------------------------
     */
    function buildCategoriesBarChart (data) {
        var canvas = $('<canvas class="barChart" id="barChart"></canvas>');
        var context = canvas.get(0).getContext('2d');

        $barChartContainer.append(canvas);

        var barData = {};
        barData.labels = [];
        barData.datasets = [{
            label: 'Category Amount',
            fillColor: "rgb(155, 213, 203)",
            strokeColor: "rgba(155, 213, 203,0.8)",
            highlightFill: "rgba(155, 213, 203,0.75)",
            highlightStroke: "rgba(155, 213, 203,1)"
        }];
        barData.datasets[0].data = [];
        for ( var name in data ) {
            if (data.hasOwnProperty(name)) {
                barData.labels.push(name);
                barData.datasets[0].data.push(data[name]);
            }
        }
console.log(barData);
        new Chart(context).Bar(barData, { responsive: true, barValueSpacing: 20 });
    }

    /**
     * ---------------------------------
     *      DATE SEARCH FORM
     * ---------------------------------
     */
    $dateSearchBtn.on('click', handleSearchBtnClick);

    function handleSearchBtnClick (e) {
        e.preventDefault();
console.log('clicked');
        app.emitEvent('search.button.click');
    }
});