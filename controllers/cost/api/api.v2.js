"use strict";

var CostApi = function () {

    /**
     * GET     /expenses
     *
     *  @return json returns all the expenses sorted by date by default for each
     *               individual user
     */
    this.getAllExpenses = function (req, res, next) {
        var query = { user: req.user._id};
        var filter = {  };
        req.app.db.models.Expense
            .find(query, filter)
            .sort({ date: -1 })
            .exec(function (err, docs) {
                if (err) {
                    // TODO log the error using some log mechanism
                    console.log(err);
                    return res.json({
                        success: false,
                        error: { msg: 'database error' }
                    });
                }

                // return the results with a success flag set to true
                return res.json({
                    success: true,
                    data: docs
                });
            });
    }

};

module.exports = exports = CostApi;