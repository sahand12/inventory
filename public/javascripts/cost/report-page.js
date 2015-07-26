$(function () {

     /*
     * -------------------------------
     *      EVENT LISTENERS
     * -------------------------------
     */
    app.addListener('page.load', buildReportsTable);
    app.addListener('create.report.submit', createReportSubmitHandler);


    /*
     * --------------------------------
     *      GLOBAL VARIABLES
     * --------------------------------
     */
    var $tableAjaxSpinner = $('.reports-table-ajax-spinner');
    var $formAjaxSpinner = $('.create-report-ajax-spinner');
    var $reportForm = $('#createReportForm');
    var $createReportBtn = $('#createReportBtn');


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
            //beforeSend: tableAjaxInProgress,
            done: tableAjaxHandler
        });
    }

    function tableAjaxInProgress () {
        $ajaxSpinner.show();
    }

    function tableAjaxHandler (response) {
        console.log(response);
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
            $formAjaxSpinner.hide();
            console.log(response);
        });
    }

    function createReportAjaxInProgress () {
        $formAjaxSpinner.show();
    }

    function createReportAjaxEnded (response) {
        console.log(response);
        $formAjaxSpinner.hide();
    }

});