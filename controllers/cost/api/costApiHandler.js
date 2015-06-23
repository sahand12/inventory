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
     * GET /cost/api/expenses
     */
    this.listAllExpenses = function (req, res, next) {
        req.app.db.models.Expense.findLatestByDays(10, function (err, docs) {
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
     * GET /cos/api/expenses/
     */
    this.listExpensesByUser = function (req, res, next) {
        req.app.db.models.Expense.findByUser(req.user._id, function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    error: err
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };
};

exports = module.exports = CostApiHandler;






























