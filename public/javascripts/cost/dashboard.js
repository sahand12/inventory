$(function () {

    app.addListener('page.load', buildPieChart);
    app.addListener('page.load', buildLineChart);
    app.addListener('page.load', buildLatestActivity);
    app.addListener('expense.form.submit.success', buildPieChart);
    app.addListener('expense.form.submit.success', buildLineChart);
    app.addListener('expense.form.submit.success', buildLatestActivity);


     /**
     * -------------------------------------------------
     *     GLOBALS
     * -------------------------------------------------
     */
     var pieChartCtx = document.getElementById('pieChart').getContext('2d'),
         $chartStat = $('#pieChartStat');

    var categoryColors = {};

     /**
     * -------------------------------------------------
     *     PAGE LOAD EVENT
     * -------------------------------------------------
     */
    app.emit('page.load');

    /**
     * -------------------------------------------------
     *     PIE CHART
     * -------------------------------------------------
     */

    function buildPieChart () {
        // get the data from the server for pie-chart
        $.ajax({
            method: "get",
            url: "/cost/api/expenses/categories?days=30"
        }).done(function (response) {
            populateLast30Days(response, categoryColors);
        });
    }


    function populateLast30Days(response, categoryColors) {
        var sortedData = app.helpers.sortPieChartAjaxResponseByAmount(response.data);
        var pieData = app.helpers.formatSortedAjaxDataForPieChart(sortedData, categoryColors);
        app.helpers.drawPieChart(pieChartCtx, pieData);
        var statData = app.helpers.formatPieDataForStatistics(pieData);
        app.helpers.showPieChartStats($chartStat,statData);
    }

    /**
     * -----------------------------------------------
     *     LINE CHART
     * -----------------------------------------------
     */
    var lineChartCtx = document.getElementById('lineChart').getContext('2d');

    function buildLineChart () {
        // get the data from the server
        $.ajax({
            method: "get",
            url: "/cost/api/expenses/this-year"
        }).done(function (response) {
            populateThisYear(response);
        });
    }

    function populateThisYear (response) {
        // first group data by each month
        var groupedData = groupDataByMonth(response.data);
        var labels = app.helpers.months;
        drawLineChart(labels, groupedData);
    }

    function groupDataByMonth (data) {
        var totalInMonths = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        for (var i = 0, len = data.length; i < len; i++) {
            var month = new Date(data[i].date).getMonth();
            totalInMonths[month] += data[i].amount;
        }
        return totalInMonths;
    }

    function drawLineChart (labels, data) {
        var lineData = {
            labels: labels,
            datasets: [
                {
                    label: "This Year Expenses",
                    fillColor: "rgba(62, 175, 144, 0.2)",
                    strokeColor: "rgb(62, 175, 144)",
                    pointColor: "rgb(62, 175, 144)",
                    pointStrokeColor: "#fff",
                    pointHighlightFill: "#fff",
                    pointHighlightStroke: "rgb(62, 175, 144)",
                    data: data
                }
            ]
        };

        return new Chart(lineChartCtx).Line(lineData, { responsive: true });
    }


    /**
     * -----------------------------------------------
     *     LATEST ACTIVITY
     * -----------------------------------------------
     */

    var $activityTable = $('#activityTable');

    function buildLatestActivity () {
        // get the data from the server
        $.ajax({
            method: "get",
            url: "/cost/api/expenses?count=5"
        }).done(function (response) {
            populateTable(response.data, categoryColors);
        });
    }

    function formatDate (date) {
        date = new Date(date);
        var year = date.getFullYear(),
            day = date.getDate(),
            month = date.getMonth();

        return app.helpers.months[month+1] + " " + day + ", " + year;
    }

    function formatAmount (value) {
        value = "" + value;
        var reverse = value.split("").reverse();
        var formatted = "";
        for (var i = 0, len = reverse.length; i < len; i++) {
            formatted += reverse[i];
            if (i % 3 === 2 && i !== len - 1) {
                formatted += ",";
            }
        }
        formatted = formatted.split("").reverse().join("");
        return formatted;
    }

    function populateTable (data, categoryColors) {
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];

            if (typeof categoryColors[current.category.name]) {
                var css = app.helpers.makeRandomColor();
                categoryColors[current.category.name] = { color: css.color, highlight: css.highlight };
            }
console.log(categoryColors);
            html += "<tr class='activity-row'><td style='background-color:" + categoryColors[current.category.name].color
                + ";'></td><td>" + current.title + " (<strong>"+  current.category.name + "</strong>)" + "</td>"
                + "<td><small>" + formatDate(current.date) + "</small></td>"
                + "<td>$" + formatAmount(current.amount) + "</td>";
        }
        $activityTable.html(html);
    }




});