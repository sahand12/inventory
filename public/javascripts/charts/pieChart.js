$(function () {

    var pieChartCtx = document.getElementById('pieChart').getContext('2d'),
        colors = ['red', 'green', 'skyblue', 'crimson', 'yellow', 'purple', 'grey'];

    // get the data from the server
    $.ajax({
        method: "get",
        url: "/cost/api/expenses"
    }).done(function (response) {
        console.log('response pie', response);
        formatRawDataForPieChart(response.data);
    });

    function formatRawDataForPieChart (data) {
        var pieData = [];

        for (var i = 0, len = data.length; i < len; i++) {
            pieData[i] = {
                value: data[i].amount,
                color: colors[i],
                highlight: "#fdb45c",
                label: data[i].title
            }
        }
        console.log(pieData);
        return new Chart(pieChartCtx, pieData);
    }

});