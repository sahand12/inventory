$(function () {

    app.addListener('page.load', buildPieChart);
    app.addListener('page.load', buildLineChart);
    app.addListener('page.load', buildLatestActivity);
    app.addListener('expense.form.submit.success', buildPieChart);
    app.addListener('expense.form.submit.success', buildLineChart);
    app.addListener('expense.form.submit.success', buildLatestActivity);

    app.emitEvent('page.load');

    /**
     * -------------------------------------------------
     *     PIE CHART
     * -------------------------------------------------
     */

    var pieChartCtx = document.getElementById('pieChart').getContext('2d'),
        $chartStat = $('#pieChartStat');

    function buildPieChart () {
        // get the data from the server for pie-chart
        $.ajax({
            method: "get",
            url: "/cost/api/expenses/categories?days=30"
        }).done(function (response) {
            populateLast30Days(response);
        });
    }


    function populateLast30Days(response) {
        var sortedData = sortRawDataByAmount(response.data);
        var pieData = formatSortedDataForPieChart(sortedData);
        drawPieChart(pieData);
        var statData = formatPieDataForStatistics(pieData);
        showPieChartStat(statData);
    }

    function sortRawDataByAmount (data) {
        var sortedArray = [];
        for (var categoryName in data) {
            if (data.hasOwnProperty(categoryName)) {
                sortedArray.push({ name: categoryName, value: data[categoryName] });
            }
        }
        sortedArray.sort(function (a, b) {
            return b.value - a.value;
        });
        return sortedArray;
    }

    function formatSortedDataForPieChart (data) {
        var pieData = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i],
                css = makeRandomColor();
            pieData.push({
                value: current.value,
                color: css.color,
                highlight: css.highLight,
                label: current.name
            });
        }
        return pieData;
    }

    function formatPieDataForStatistics (data) {
        var statData = [],
            total = 0;
        for (var i = 0, len = data.length; i < len; i++) {
            total += data[i].value;
        }
        for (i = 0; i < len; i++) {
            statData.push({
                name: data[i].label,
                color: data[i].color,
                percent: ( 100 * (data[i].value/total) ).toFixed(2)
            });
        }
        return statData;
    }

    function drawPieChart (data) {
        return new Chart(pieChartCtx).Pie(data)
    }

    function makeRandomColor () {
        var red = Math.floor( Math.random() * 256 ),
            green = Math.floor( Math.random() * 256 ),
            blue = Math.floor( Math.random() * 256 );

        var color = "rgb(" + red + ", " + green + ", " + blue + ")",
            highLight = "rgba(" + red + ", " + green + ", " + blue + ", 0.7)";

        return { color: color, highLight: highLight };
    }

    function showPieChartStat (data) {
        // first empty the container
        $chartStat.empty();
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            html += "<div class='pie-chart-stat-item'>" +
                "<span class='square-block pull-left' style='background: " + current.color + "'></span>" +
                "<p class='pull-left text-capitalize'><strong>" + current.name + "</strong> &nbsp;" + current.percent + "%</p>" +
                "</div>";
        }
        $chartStat.html(html);
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
        var labels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
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

    var $activityTable = $('#activityTable'),
        months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    function buildLatestActivity () {
        // get the data from the server
        $.ajax({
            method: "get",
            url: "/cost/api/expenses?count=5"
        }).done(function (response) {
            console.log(response);
            populateTable(response.data);
        });
    }

    function formatDate (date) {
        date = new Date(date);
        var year = date.getFullYear(),
            day = date.getDate(),
            month = date.getMonth();

        return months[month+1] + " " + day + ", " + year;
    }

    function formatAmount (value) {
        value = ("" + value).split("");
        var formatted = [];
        for (var len = value.length, i = len - 1; i >= 0; i--) {
            var j = i - len + 2;
            console.log(j, i, value);
            formatted.push(value[i]);
            if (j % 3 === 0 && j !== len) {
                formatted.push(",");
            }
        }
        return formatted.join();
    }

    function populateTable (data) {
        var html = "";
        for (var i = 0, len = data.length; i < len; i++) {
            var current = data[i];
            html += "<tr class='activity-row'><td></td><td>" + current.title + "</td>"
                + "<td><small>" + formatDate(current.date) + "</small></td>"
                + "<td>$" + formatAmount(current.amount) + "</td>";
        }
        $activityTable.html(html);
        console.log(html);
    }




});