//     controllers/cost/api/costAdminApiHandler.js
"use strict";

var objectId = require('mongodb').ObjectID;

function isInt(n) {
    return n === Math.round(n);
}

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
     * @var Object - A reference to the ExpenseCategory collection
     */
    var ExpenseCategory = app.db.models.ExpenseCategory;


    /*
     * -------------------------------------
     *       USERS ROUTES
     * -------------------------------------
     */
     // GET    /cost/api/admin/users
    this.getAllUsers = function (req, res, next) {
        var keys = { email: 1, role: 1, name: 1, 'profile.birthday': 1, 'profile.cellphone': 1, 'profile.homeAddress.tel': 1 };
        Users.find({}, keys).
            sort({ 'name.last': 1 })
            .exec(function (err, users) {
                return __sendResponse(res, err, users);
            });
    };

    // GET     /cost/api/admin/users/:id
    this.getUserById = function (req, res, next) {
        var keys = { email: 1, role: 1, name: 1, 'profile.birthday': 1, 'profile.cellphone': 1 };
        var userId = req.params.id;

        if (!objectId.isValid(userId)) {
            return __sendResponse(res, true, null, "invalid user id");
        }
        Users.findOne({ _id: userId }, keys).exec(function (err, user) {
            return __sendResponse(res, err, user);
        });
    };

    // GET    /cost/api/admin/users/:userId/expenses?count=...
    this.getExpensesForAUser = function (req, res, next) {
        var keys = { title: 1, date: 1, description: 1, amount: 1, 'category.name': 1 };
        var userId = req.params.userId;
        if (!objectId.isValid(userId)) {
            return __sendResponse(res, true, null, 'Invalid user id');
        }

        var query = { user: userId };
        var count = req.query.count || 100;
        Expenses.find(query, keys)
            .sort({ date: -1 })
            .limit(count)
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

    // GET     /cost/api/admin/users/total-expenses
    this.getTotalExpensesForEachUser = function (req, res, next) {
        Expenses.aggregate([{
            $group: {
                _id: "$user",
                total: { $sum: "$amount" }
            }
        }], function (err, docs) {
            return __sendResponse(res, err, docs);
        });
    };


    /*
     * ----------------------------
     *       EXPENSES ROUTES
     * ----------------------------
     */
     // GET    /cost/api/admin/expenses
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
                return __sendResponse(res, err, docs);
            });
    };

     // GET     /cost/api/admin/expenses/between ? start=..&end=...
    this.getAllExpensesBetweenTwoDates = function (req, res, next) {
        var start = req.query.start || Date.now() - 3600 * 24 * 30 * 1000;
        var end = req.query.end || Date.now();

        if (start >= end) {
            return __sendResponse(res, false, []);
        }

        var query = { 'createdAt': { $lte: end, $gte: start } };
        Expenses.find(query)
            .sort({ 'createdAt': -1 })
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

    // GET     /cost/api/admin/expenses/categories/:name

    this.getAllExpensesForACategory = function (req, res, next) {
        var categoryName = req.params.name || "";
        categoryName = categoryName.trim();

        Expenses.find({ 'category.name': categoryName })
            .sort({ createdAt: -1 })
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

     // GET    /cost/api/admin/expenses/total
    this.getTotalExpensesAmount = function (req, res, next) {
        Expenses.aggregate([
            { $group: { _id: null, total: { $sum: '$amount'} } }
        ], function (err, total) {
            return __sendResponse(res, err, total);
        });
    };

    // GET     /cost/api/admin/expenses/categories
    this.getAllExpensesGroupedByCategories = function (req, res, next) {
        Expenses.aggregate([
            {
                $group: {
                    _id: '$category.name',
                    total: { $sum: "$amount" },
                    data: { $push: { title: '$title', amount: '$amount', description: '$description', date: '$date' } }
                }
            }
        ], function (err, docs) {
            return __sendResponse(res, err, docs);
        })
    };


    /*
     * ---------------------------------
     *      CATEGORIES ROUTES
     * ---------------------------------
     */
     // GET     /cost/api/admin/categories
    this.getAllCategories = function (req, res, next) {
        ExpenseCategory.find({}, { name: 1 }).exec(function (err, docs) {
            return __sendResponse(res, err, docs);
        });
    };

    // GET    /cost/api/admin/categories/:id/expenses
    this.getAllExpensesForACategory = function (req, res, next) {
        var count = req.query.count || 20;
        var keys = { title: 1, date: 1, description: 1, amount: 1, 'category.name': 1 };
        var categoryId = req.params.id;
        if (!objectId.isValid(categoryId)) {
            return __sendResponse(res, true, null, 'Invalid category id');
        }

        var query = { 'category.id': categoryId };
        Expenses.find(query, keys)
            .populate('user', 'name')
            .sort({ date: -1 })
            .limit(count)
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };


    /*
     * ------------------------------
     *     DAILY REPORTS ROUTES
     * ------------------------------
     */
    // GET     /cost/api/admin/daily-reports?count=...
    this.getAllDailyReports = function (req, res, next) {
        var count = req.query.count || 20;
        req.app.db.models.DailyReport.find()
            .sort({ "date": -1 })
            .limit(count)
            .populate('user', 'name')
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

};

exports = module.exports = costAdminApiHandler;