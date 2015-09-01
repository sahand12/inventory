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
        var options = {
            keys: {
                amount: 1,
                'category.name': 1,
                date: 1,
                description: 1,
                title: 1,
                user: 1
            },
            page: (parseInt(req.query.page) || 1),
            sort: {
                date: -1
            },
            limit: req.query.limit || 20,
            populate: {
                tableName: 'user',
                tableField: 'name'
            }
        };

        // If It has a search query
        if (typeof req.query.q !== 'undefined') {
            var queryPattern = new RegExp('^.*?' + req.query.q.trim() + ".*$", "i");
            options.filters = {
                $or: [{ title: queryPattern }, { description: queryPattern }]
            }
        }

        Expenses.pagedFind(options, function (err, docs) {
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
        });
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

    // GET     /cost/api/admin/categories/expenses/total
    this.getTotalByCategory = function (req, res, next) {
        Expenses.aggregate([
            {
                $group: {
                    _id: { id: '$category.id', name: '$category.name' },
                    total: { $sum: '$amount' }
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ], function (err, docs) {
            return __sendResponse(res, err, docs);
        });
    };

    // GET    /cost/api/admin/categories/expenses?start=..&end=..
    this.getAllExpensesForEachCategory = function (req, res, next) {
        var start = req.query.start || Date.now() - 1000 * 3600 * 24 * 31;
        var end = req.query.end || Date.now();
        start = new Date(start);
        end = new Date(end);

        Expenses.aggregate([
            {
                $match: { date: { $gte: start, $lte: end } }
            },
            {
                $group: {
                    _id: { id: '$category.id', name: '$category.name' },
                    total: {$sum: '$amount'}
                }
            },
            {
                $sort: {
                    total: -1
                }
            }
        ], function (err, docs) {
            return __sendResponse(res, err, docs);
        });
    };

    // GET    /cost/api/admin/categories/:categoryName/expenses?start=..&end=..
    this.getAllExpensesForACategory = function (req, res, next) {
        var count = req.query.count || 100;
        var keys = { title: 1, date: 1, description: 1, amount: 1, 'category.name': 1, user: 1 };
        var categoryName = req.params.categoryName && req.params.categoryName.toLowerCase();

        var start = req.query.start || Date.now() - 1000 * 3600 * 24 * 31;
        var end = req.query.end || Date.now();
        start = new Date(start);
        end = new Date(end);

        var query = { 'category.name': categoryName, date: { $gte: start, $lte: end } };
        Expenses.find(query)
            .populate('user', 'name')
            .sort({ date: -1 })
            .limit(count)
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

    // POST     /cost/api/admin/categories
    this.createNewCategory = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('categoryName', 'Name field is required').notEmpty();

            var errors = req.validationErrors(true);
            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: errors
                });
            }
            workflow.emit('checkDuplicateCategoryName', req.body.categoryName.toLowerCase().trim());
        });

        workflow.on('checkDuplicateCategoryName', function (categoryName) {
            ExpenseCategory.findOne({ name: categoryName }, function (err, doc) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        error: { msg: 'database error'}
                    })
                }
                if (doc) {
                    return res.json({
                        success: false,
                        validationErrors: {
                            'categoryName': { param: 'categoryName', value: categoryName, msg: "The `" + categoryName + "` already exists in the system." }
                        }
                    });
                }
                workflow.emit('createNewCategory', categoryName);
            });
        });

        workflow.on('createNewCategory', function (name) {
            var fieldsToSet = {
                name: name,
                user: req.user._id
            };
            ExpenseCategory.create(fieldsToSet, function (err, doc) {
                return __sendResponse(res, err, doc);
            });
        });

        workflow.emit('validate');
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

    // GET     /cost/api/admin/users/:userId/daily-reports
    this.getAllDailyReportsForAUser = function (req, res, next) {
        var count = req.query.count || 100;
        var userId = req.params.userId;
        DailyReports.find({ user: userId })
            .sort({ date: -1 })
            .limit(count)
            .exec(function (err, docs) {
                return __sendResponse(res, err, docs);
            });
    };

};

exports = module.exports = costAdminApiHandler;