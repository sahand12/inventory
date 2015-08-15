//     controllers/cost/api/costAdminApiHandler.js
"use strict";

var objectId = require('mongodb').ObjectID;

function isInt(n) {
    return n === Math.round(n);
}

var costAdminApiHandler = function (app) {

    /**
     * @var Object - A refernce to the users collection
     */
    var Users = app.db.models.User;

    /**
     * @var Object - A reference to the expenses collection
     */
    var Expenses = app.db.models.Expense;

    /**
     * @var Object - A reference to the DailyReports collection
     */
    var DailyReports = app.db.models.DailyReport;


    /**
     *  GET    /cost/api/admin/users
     */
    this.getAllUsers = function (req, res, next) {
        var keys = { email: 1, role: 1, name: 1, 'profile.birthday': 1, 'profile.cellphone': 1 };
        Users.find({}, keys).
            sort({ 'name.last': 1 })
            .exec(function (err, users) {
            if (err) {
                return res.json({
                    success: false,
                    errors: { msg: 'Database Error' }
                });
            }
            return res.json({
                success: true,
                data: users
            });
        });
    };


    /*
     * GET     /cost/api/admin/users/:id
     */
    this.getUserById = function (req, res, next) {
        var keys = { email: 1, role: 1, name: 1, 'profile.birthday': 1, 'profile.cellphone': 1 };
        var userId = req.params.id;

        if (!objectId.isValid(userId)) {
            return res.send({
                success: false,
                error: { msg: 'invalid user id' }
            })
        }

        Users.findOne({ _id: userId }, keys).exec(function (err, user) {
            if (err) {
                return res.json({
                    success: false,
                    errors: { msg: "Database Error" }
                });
            }
            return res.json({
                success: true,
                data: user
            });
        });
    };


    /*
     * GET    /cost/api/admin/expenses
     */
    this.getAllExpenses = function (req, res, next) {
        var keys = {};
        var limit = (req.query.limit && (parseInt(req.query.limit) > 0)) ? req.query.limit : 50;
        var skip = (req.query.skip && (parseInt(req.query.skip) > 0)) ? req.query.skip : 0;

        Expenses.find()
            .populate('user', 'name')
            .skip(skip)
            .limit(limit)
            .sort({ 'createdAt': -1 })
            .exec(function (err, docs) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        error: { msg: 'Database Error' }
                    });
                }
                return res.json({
                    success: true,
                    data: docs
                });
            });
    };


    /*
     * GET     /cost/api/admin/expenses/between ? start=..&end=...
     */
    this.getAllExpensesBetweenTwoDates = function (req, res, next) {
        var start = req.query.start || Date.now() - 3600 * 24 * 30 * 1000;
        var end = req.query.end || Date.now();
        console.log(new Date(start), new Date(end));
        if (start >= end) {
            return res.json({
                success: true,
                data: []
            });
        }

        var query = { 'createdAt': { $lte: end, $gte: start } };
        Expenses.find(query)
            .sort({ 'createdAt': -1 })
            .exec(function (err, docs) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        error: { msg: 'Database Error' }
                    });
                }
                return res.json({
                    success: true,
                    data: docs
                });
            });
    };


    /*
     * GET     /cost/api/admin/expenses/categories/:name
     */
    this.getAllExpensesForACategory = function (req, res, next) {
        var categoryName = req.params.name || "";
        categoryName = categoryName.trim();

        Expenses.find({ 'category.name': categoryName })
            .sort({ createdAt: -1 })
            .exec(function (err, docs) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        error: { msg: "Database error" }
                    });
                }
                return res.json({
                    success: true,
                    name: categoryName,
                    data: docs
                });
            });
    };


    /*
     * GET    /cost/api/expenses/user/:id
     */
    this.getAllExpensesForAUser = function (req, res, next) {
        var userId = req.params.id;
        if (!objectId.isValid(userId)) {
            return __sendResponse(res, true, null, 'Invalid user id');
        }

        Expenses.find({ user: req.params.id })
            .sort({ createdAt: -1 })
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };


    /*
     * GET    /cost/api/admin/expenses/total
     */
    this.getTotalExpensesAmount = function (req, res, next) {
        Expenses.aggregate([
            { $group: { _id: '$_id' }, total: { $sum: '$amount'} }
        ], function (err, total) {
            __sendResponse(res, err, total);
        });
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

exports = module.exports = costAdminApiHandler;