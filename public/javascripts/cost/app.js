var app = new EventEmitter();

/**
 * -------------------------------
 *      HELPER FUNCTIONS
 * -------------------------------
 */

app.helpers = {};
app.helpers.months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

app.helpers.formatDate = function formatDate (date) {
    date = new Date(date);
    var year = date.getFullYear(),
        day = date.getDate(),
        month = date.getMonth();

    return app.helpers.months[month] + " " + day + ", " + year;
};

app.helpers.formatAmount = function formatAmount (value) {
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
};

// data is the sorted data for pie chart
app.helpers.calculateTotalExpensesAmount = function (data) {
    var total = 0;
    for (var i = 0, len = data.length; i < len; i++) {
        total += data[i].value;
    }
    return total;
};

app.helpers.generateRandomInt = function (range) {
    return Math.floor(Math.random() * range);
};

app.helpers.makeRandomColor = function makeRandomColor () {
    var red = Math.floor( Math.random() * 256 ),
        green = Math.floor( Math.random() * 256),
        blue = Math.floor( Math.random() * 256 );

    var color = "rgb(" + red + ", " + green + ", " + blue + ")",
        highlight = "rgba(" + red + ", " + green + ", " + blue + ", 0.7)";

    return { color: color, highlight: highlight };
};

app.helpers.sortPieChartAjaxResponseByAmount = function (data) {
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
};

app.helpers.formatSortedAjaxDataForPieChart = function (data, categoryColors) {
    //console.log('sahand', data);
    var pieData = [];
    for (var i = 0, len = data.length; i < len; i++) {
        var current = data[i],
            css = app.helpers.makeRandomColor();

        if (typeof categoryColors[current.name] === "undefined") {
            categoryColors[current.name] = { color: css.color, highlight: css.highlight };
        }

        pieData.push({
            value: current.value,
            color: categoryColors[current.name].color,
            highlight: categoryColors[current.name].highlight,
            label: current.name
        });
    }
    return pieData;
};

app.helpers.formatPieDataForStatistics = function (data) {
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
};

app.helpers.drawPieChart = function drawPieChart (context, data) {
    return new Chart(context).Pie(data, {
        segmentShowStroke: false,
        segmentStrokeWidth: 1
    })
};

app.helpers.showPieChartStats = function ($statContainer, data) {
    // first empty the container
    $statContainer.empty();
    var html = "";
    for (var i = 0, len = data.length; i < len; i++) {
        var current = data[i];
        html += "<div class='pie-chart-stat-item'>" +
        "<span class='square-block pull-left' style='background: " + current.color + "'></span>" +
        "<p class='pull-left text-capitalize'><strong>" + current.name + "</strong> &nbsp;" + current.percent + "%</p>" +
        "</div>";
    }
    $statContainer.html(html);
};

app.helpers.formatDateForInput = function (date) {
    return new Date(date).toISOString().substring(0, 10);
};

app.helpers.date = {};

app.helpers.date.dateAsObject = function (date) {
    return {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
    };
};

app.helpers.populateSelectCategory = function (data, $select) {
    var html = "";
    for (var i = 0, len = data.length; i < len; i++) {
        html += "<option class='text-capitalize' value='" + data[i].toLowerCase() + "'>" + data[i] + "</option>";
    }
    $select.html(html);
};

//
app.helpers.emptyFormErrors = function (group) {
    var args = [].slice.call(arguments, 1);
    group.removeClass('has-error');
    for (var i = 0, len = args.length; i < len; i++) {
        args[i].empty();
    }
};

app.helpers.capitalizeFirstLetter = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * ----------------------------------------
 *     CHART.JS DEFAULT OPTIONS
 * ----------------------------------------
 */
Chart.defaults.global.scaleLabel = "<%=app.helpers.formatAmount(value) + ' ﷼'%>";
Chart.defaults.global.scaleFontSize = 12;
Chart.defaults.global.tooltipFontSize = 12;
Chart.defaults.global.tooltipTemplate = "<%if (label){%><%=label%>: <%}%><%= app.helpers.formatAmount(value) + ' ﷼' %>";
Chart.defaults.global.tooltipTitleFontFamily = "courier, 'Helvetica Neue', Helvetica, Arial, sans-serif";
Chart.defaults.global.segmentStrokeWidth = 1;


/**
 * --------------------------------------
 *      JQUERY AJAX GLOBAL CONFIGS
 * --------------------------------------
*/