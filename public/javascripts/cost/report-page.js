$(function () {

     /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildReportsTable);
    app.addListener('create.report.submit', createReportSubmitHandler);
    app.addListener('create.report.success', buildReportsTable);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var $tableAjaxSpinner = $('.reports-table-ajax-spinner');
    var $formAjaxSpinner = $('.create-report-ajax-spinner');
    var $reportForm = $('#createReportForm');
    var $createReportBtn = $('#createReportBtn');
    var $reportsTable = $('#reportsTable');
    var $reportsTableBody = $('#reportsTableBody');
    var $reportsTableDeleteBtn = $('.reports-table-delete-button');
    var $reportsTableTypeBtn = $('.reports-table-type');


    /*
     * -----------------------------------------------
     *      EMIT PAGE LOAD EVENT
     * -----------------------------------------------
     */
    app.emitEvent('page.load');


    /*
     * ----------------------------------------
     *      REPORTS TABLE
     * ----------------------------------------
     */
    function buildReportsTable () {
        // Fetch reports from database
        $.ajax({
            method: 'get',
            url: '/cost/api/reports',
            beforeSend: tableAjaxInProgress
        }).done(function (response) {
            tableAjaxEnded(response);
        });
    }

    function tableAjaxInProgress () {
        // clear the table
        $reportsTableBody.html("");
        $tableAjaxSpinner.show();
    }

    function tableAjaxEnded (response) {
        $tableAjaxSpinner.hide();

        // build the table
        populateReportsTable(response.data);
    }

    function populateReportsTable (data) {
        var html = "";
        console.log(data);
        for (var i = 0, len = data.length; i < len; i++) {
            var report = data[i];

            html += "<tr><td><span class='" + ( (report.type === 'pdf') ? "fa fa-file-pdf-o" : "fa fa-file-excel-o" ) + "'></span></td>" +
                "<td><div class='row reports-table-name'>" + report.name + "</div><div class='row reports-table-dates'>" + app.helpers.formatDate(report.startDate) + " - " + app.helpers.formatDate(report.endDate) + "</div></td>" +
                "<td><a download class='reports-type-anchor' href='/files/reports/" + report.fileName + "'><div class='reports-table-type text-uppercase text-center' data-report-type=" + report.type + "><span>" + report.type + "</span></div></td>" +
                "<td><div class='reports-table-delete-button text-center'><span class='glyphicon glyphicon-trash'></span></div></td>" +
                "</tr>";
        }
        $reportsTableBody.append(html);
    }

    /*
     * ---------------------------------
     *     CREATE REPORT FORM
     * ---------------------------------
     */
    $reportForm.on('submit', function (e) {
        e.preventDefault();

        // Error clean up
        $reportForm.find('.form-group').removeClass('has-error');
        $('.cost-form-error-item').html("");

        app.emit('create.report.submit');
    });

    function createReportSubmitHandler () {
        // validate user input
        var isValid = validateReportInputs();

        if (isValid) {
            var formData = {
                title: $('#reportTitle').val(),
                startDate: new Date($('#reportStartDate').val()).valueOf(),
                endDate: new Date($('#reportEndDate').val()).valueOf(),
                type: $('#reportType').val()
            };
            // send the request to server
            createReportAjax(formData);
        }
    }

    function validateReportInputs () {
        var result = true;
        $('#createReportForm').find('input').each(function (i, elem) {
            var $this = $(this);
            if (!$this.val()) {
                $this.siblings('p').html('&bull; <b>' + $this.attr('placeholder') + "</b> can not be empty")
                    .closest('.form-group').addClass('has-error');
                result = false;
            }
        });
        var $type = $('#reportType');
        if (! $type.val()) {
            $type.siblings('p').html('&bull; <b>Type</b> should be PDF or CSV');
            result = false;
        }

        return result;
    }

    function createReportAjax (formData) {
        console.log(formData);
        $.ajax({
            method: 'post',
            url: '/cost/api/reports',
            data: formData,
            beforeSend: createReportAjaxInProgress
        }).done( function (response) {
            createReportAjaxEnded(response);
        });
    }

    function createReportAjaxInProgress () {
        $formAjaxSpinner.show();
    }

    function createReportAjaxEnded (response) {
        $formAjaxSpinner.hide();
        app.emit('create.report.success');
    }


    /*
     * ----------------------------------------------------
     *      HOVER AND CLICK EVENTS FOR DELETE AND DOWNLOAD BUTTONS
     * ----------------------------------------------------
     */
    $reportsTable.delegate('.reports-table-type span', 'mouseover mouseleave', function (e) {
        var $this = $(this);
        if (e.type === 'mouseover') {
            $this.html("").addClass('glyphicon glyphicon-save');
        }
        else if (e.type === 'mouseleave') {
            $this.removeClass('glyphicon glyphicon-save').text( $this.parent().attr('data-report-type'));
        }
    });
});