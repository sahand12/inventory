'use strict';

var CostApiHandler = function (app) {

    /*
     * GET /cost/api/categories
     */
    this.listAllCategories = function (req, res, next) {
        req.app.db.models.ExpenseCategory.find(function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    error: "Database Error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cost/api/expenses/category/:categoryName
     */
    this.listExpensesByCategory = function (req, res, next) {
        console.log(req.params);

        req.app.db.models.Expense.findByCategory(req.params.categoryName, req.user._id, function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    error: "database Error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cos/api/expenses?count=number
     */
    this.listExpensesByUser = function (req, res, next) {
        var count = req.query.count || 5;
        req.app.db.models.Expense.findByUser(req.user._id, count, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cost/api/expenses/total
     */
    this.showTotalExpenses = function (req, res, next) {
        req.app.db.models.Expense.findTotalExpensesByCategory(req.user._id, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cost/api/expenses/categories?days=number
     */
    this.showTotalExpensesByEachCategory = function (req, res, next) {
        var days = req.query.days || 30;
        req.app.db.models.Expense.findTotalExpenseByEachCategory(req.user._id, days, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /**
     * Get /cost/api/expenses/this-year
     */
    this.showThisYearExpenses = function (req, res, next) {
        req.app.db.models.Expense.findThisYearExpenses(req.user._id, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }

            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /**
     * GET /cost/api/expenses/count
     */
    this.findTotalNumberOfExpenses = function (req, res, next) {
        req.app.db.models.Expense.count({ user: req.user._id }, function (err, count) {
            if (err) {
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                count: count
            });
        });
    };

};

exports = module.exports = CostApiHandler;






























