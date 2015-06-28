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

    /**
     * PUT /cost/api/expenses
     */
    this.handleUpdateExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        // TODO: validate that title has only words, spaces and numbers
        // TODO: validate description as well
        workflow.on('validate', function () {
            var amount = parseInt(req.body.amount);
            req.checkBody('title', 'each expense should have a title').notEmpty();
            req.checkBody('amount', 'provide an amount').notEmpty();
            req.checkBody('category', 'select a category').notEmpty();
            req.checkBody('date', 'provide a valid date (mm/dd/yyyy)').isDate();

            var errors = req.validationErrors(true);
            if (isNaN(amount) || amount < 0) {
                errors = errors || {};
                errors.amount = { param: "amount", msg: "provide a positive number", value: req.body.amount };
            }

            if (errors) {
                var data = {
                    success: false,
                    validationErrors: errors
                };
                return res.send(data);
            }
            workflow.emit('findCategory', req.body.category.toLowerCase());
        });

        workflow.on('findCategory', function (categoryName) {
            req.app.db.models.ExpenseCategory.findOne({name: categoryName}, function (err, category) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: 'Database Error'
                    });
                }
                if (!category) {
                    return res.send({
                        success: false,
                        postErrors: { error: 'Invalid category' }
                    });
                }
                workflow.emit('updateExpense', category._id, category.name);
            });
        });

        workflow.on('updateExpense', function (categoryId, categoryName) {
            var updateQuery = {
                $set: {
                    title: req.body.title,
                    amount: req.body.amount,
                    date: req.body.date,
                    description: req.body.description,
                    'category.name': categoryName,
                    'category.id': categoryId
                }
            };
            req.app.db.models.Expense.findByIdAndUpdate(req.body._id, updateQuery, function (err, newDoc) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                return res.send({
                    success: true,
                    data: newDoc
                });
            });
        });

        workflow.emit('validate');
    };

    /**
     * DELETE  /cost/api/expense
     */
    this.handleDeleteExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('_id', 'invalid expense item').notEmpty();

            var errors = req.validationErrors();

            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: { _id: { param: "id", msg: "no item is selected", value: req.body._id } }
                });
            }

            workflow.emit('findExpense', req.body._id);
        });

        workflow.on('findExpense', function (id) {
            req.app.db.models.Expense.findById(id).remove(function (err, doc) {
                if (err) {
                    return res.send({
                        success: false,
                        postErrors: { error: "database error" }
                    });
                }
                console.log(doc);
                return res.send({
                    success: true,
                    data: doc
                });
            });
        });

        workflow.emit('validate');
    }

};

exports = module.exports = CostApiHandler;






























