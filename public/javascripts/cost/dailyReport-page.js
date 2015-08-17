$(function () {

    /*
     * --------------------------------
     *     EVENT LISTENERS
     * --------------------------------
     */
    app.addListener('page.load', buildDailyReportsTable);
    app.addListener('dailyReportFormSubmit', makeDailyReportFormAjaxReq);
    app.addListener('dailyReportFormClientError', showDailyReportFormClientErrors);


    /*
     * --------------------------------
     *     GLOBAL VARIABLES
     * --------------------------------
     */
    var $dailyReportForm = $('#dailyReportForm');
    var $dailyReportSubmitBtn = $dailyReportForm.find('button');
    var $titleError = $('#dailyReportTitle').siblings('p');
    var $bodyError = $('#dailyReportBody').siblings('p');
    var $dailyReportAjaxSpinner = $('.dailyReport-form-ajax-spinner');


    /*
     * --------------------------------
     *     HELPER FUNCTIONS
     * --------------------------------
     */
    function showForNSec ($elem, secs) {
        $elem.appendTo('body').addClass('vgn-flash-msg');
        setTimeout(function () {
            $elem.remove();
        }, secs || 4000);
    }

    /*
     * --------------------------------
     *       USER DAILY REPORTS LIST
     * --------------------------------
     */
    function buildDailyReportsTable () {

    }

    /*
     * ----------------------------------
     *     SUBMIT DAILY REPORT HANDLER
     * ----------------------------------
     */
    $dailyReportForm.on('submit', function (e) {
        e.preventDefault();
        var $this = $(this);
        var data = {
            title: app.helpers.escapeInput($this.find('#dailyReportTitle').val()),
            body: app.helpers.escapeInput($this.find('#dailyReportBody').val())
        };

        // delete any past errors
        cleanDailyReportForm();

        if (data.title.length === 0 || data.body.length === 0) {
            app.emit('dailyReportFormClientError', data);
        }
        else {
            app.emit('dailyReportFormSubmit', data);
        }
    });

    function cleanDailyReportForm () {
        $dailyReportForm.find('.form-group').removeClass('has-error');
        $dailyReportForm.find('.cost-form-error-item').html("");
    }

    function makeDailyReportFormAjaxReq (data) {
        $.ajax({
            url: '/cost/api/daily-reports',
            method: 'post',
            data: data,
            beforeSend: dailyReportAjaxInProgress
        }).done(function (response) {
            dailyReportAjaxEnded(response);
        });
    }

    function dailyReportAjaxInProgress () {
        $dailyReportAjaxSpinner.show();
    }

    function dailyReportAjaxEnded (response) {
        setTimeout(function () {
            console.log(response);
            $dailyReportAjaxSpinner.hide();

            // show flash message
            var $successMsg = $('#dailyReportSuccessMsg');
            $successMsg.show();
            setTimeout(function () {
                $successMsg.fadeOut();
            }, 2000);

            // clear the form
            $dailyReportForm.find('input, textarea').val("");
        }, 500);
    }

    function showDailyReportFormClientErrors (data) {
        if (data.title.length === 0) {
            $titleError.html('&bull; <b>Title</b> field can not be empty')
                .closest('.form-group')
                .addClass('has-error');
        }
        if (data.body.length === 0) {
            $bodyError.html('&bull; <b>Report text</b> field can not be empty')
                .closest('.form-group')
                .addClass('has-error');
        }
    }
});