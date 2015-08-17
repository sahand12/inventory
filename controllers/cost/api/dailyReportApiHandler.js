//     controllers/cost/api/dailyReportApiHandler.js
'use strict';

var objectId = require('mongodb').ObjectID;

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
};

exports = module.exports = DailyReportApiHandler;