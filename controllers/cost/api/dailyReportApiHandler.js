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
     * GET    /cost/api/admin/daily-reports/
     */

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