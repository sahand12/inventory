//     controllers/cost/api/dailyReportApiHandler.js
'use strict';

var objectId = require('mongodb').ObjectID;

function __sendResponse (res, err, data, msg) {
    if (err) {
        console.log(err);
        return res.json({
            success: false,
            error: { msg: msg || 'Database error' }
        });
    }
    else {
        return res.json({
            success: true,
            data: data
        });
    }
}

var DailyReportApiHandler = function (app) {

    /*
     * @var Object - A reference to the DailyReport collection
     */
    var DailyReports = app.db.models.DailyReport;


    /*
     * GET    /cost/api/admin/daily-reports
     */
    this.getAllDailyReports = function (req, res, next) {
        var query = {};
        var filter = {};
        DailyReports.find(query)
            .sort({ date: -1 })
            .exec(function (err, docs) {
                __sendResponse(res, err, docs);
            });
    };


    /*
     * POST    /cost/api/daily-reports/
     */
    this.createNewDailyReport = function (req, res, next) {
        var workflow = app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('title', 'Title field can not be empty').notEmpty();
            req.checkBody('body', 'Report text field can not be empty').notEmpty();

            var errors = req.validationErrors(true);
            if (errors) {
                return res.json({
                    success: false,
                    errors: errors
                });
            }
            workflow.emit('insertNewReport');
        });

        workflow.on('insertNewReport', function () {
            var fieldsToSet = {
                user: req.user._id,
                title: req.body.title.trim(),
                body: req.body.body.trim()
            };

            DailyReports.create(fieldsToSet, function (err, doc) {
                __sendResponse(res, err, doc);
            })
        });

        workflow.emit('validate');
    };


    /*
     * GET     /cost/api/user/:userId/daily-reports?limit=n
     */
    this.getAllDailyReportsForAUser = function (req, res, next) {
        if (!objectId.isValid(req.params.userId)) {
            return __sendResponse(res, true, null, 'invalid user id');
        }
        var query = { user: req.params.userId};
        var filter = {};
        DailyReports.find(query, filter)
            .sort({ date: -1 })
            .limit(req.query.limit || 5)
            .exec(function (err, docs) {
                console.log(err, docs);
                __sendResponse(res, err, docs);
            });
    };


    /*
     * GET     /cost/api/daily-reports/date/:dateTime
     * the format of the date is dd-mm-yyyy
     */
    this.getAllDailyReportsForADay = function (req, res, next) {
        var datePattern = /^(\d{2})-(\d{2})-(\d{4})$/;
        var date = req.params.dateTime.match(datePattern).slice(1,4);
        date = new Date(date[2], date[1] - 1, date[0]).valueOf();
        var nextDay = date + 1000 * 24 * 3600;

        var query = { date: { $gte: date , $lte: nextDay } };
        DailyReports.find(query)
            .exec(function (err, docs) {
                __sendResponse(res, err, docs);
            });
    };

};

exports = module.exports = DailyReportApiHandler;