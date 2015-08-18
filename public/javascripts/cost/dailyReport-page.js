$(function () {

    /*
     * --------------------------------
     *     EVENT LISTENERS
     * --------------------------------
     */
    app.addListener('page.load', buildDailyReportsTable);
    app.addListener('dailyReportFormSubmit', makeDailyReportFormAjaxReq);
    app.addListener('dailyReportFormSuccess', buildDailyReportsTable);
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
    var $dailyReportTableBody = $('#dailyReportTable').find('tbody');
    var $dailyReportTableAjaxSpinner = $('.dailyReport-table-ajax-spinner');
    var dailyReportTableTemplate = $('#dailyReportTableTemplate').text();


    /*
     * ------------------------------
     *      FIRE LOAD EVENT
     * ------------------------------
     */
    app.emit('page.load');



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
        var userId = $dailyReportTableBody.attr('data-user-id');
        $.ajax({
            url: '/cost/api/user/' + userId + '/daily-reports',
            method: 'get',
            beforeSend: dailyReportTableAjaxInProgress
        }).done(function (response) {
            dailyReportTableAjaxEnded(response);
        });
    }

    function dailyReportTableAjaxInProgress () {
        $dailyReportTableAjaxSpinner.show();
    }

    function populateDailyReportTable(data) {
        var html = [];
        for (var i = 0, len = data.length; i < len; i++) {
            var temp = dailyReportTableTemplate;
            var current= data[i];
            temp = temp.replace('[[color]]', app.helpers.makeRandomColor().color)
                .replace('[[date]]', app.helpers.formatDate(current.date))
                .replace('[[title]]', current.title)
                .replace('[[id]]', current._id);
            html.push(temp);
        }
        $dailyReportTableBody.html(html.join(""));
    }

    function dailyReportTableAjaxEnded (response) {
        console.log(response);
        $dailyReportTableAjaxSpinner.hide();
        if (response.success) {
            populateDailyReportTable(response.data);
        }
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

            // emit success event
            app.emit('dailyReportFormSuccess');
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