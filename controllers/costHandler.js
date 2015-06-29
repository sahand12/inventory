/**
 * Created by sahand on 6/19/15.
 */
"use strict";

var CostHandler = function CostHandler (app) {

    /*
     * GET /cost/dashboard
     */
    this.showDashboard = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "Dashboard",
            bodyClass: 'cost-dashboard',
            dashboardPage: true,
            googleFonts: false
        };
        //console.log(data);
        return res.render('cost/dashboard', data);
    };

    /**
     * POST /cost/expenses
     */
    this.handleAddExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            var amount = parseInt(req.body.amount);
            req.checkBody('title', 'Each expense should have a title').notEmpty();
            req.checkBody('date', 'provide a valid date').isDate();
            req.checkBody('amount', 'provide an amount').notEmpty();
            req.checkBody('category', 'provide a category').notEmpty();

            var errors = req.validationErrors(true);
            if (isNaN(amount) || amount < 0) {
                errors = errors || {};
                errors.amount = { param: 'amount', msg: 'provide a positive number', value: req.body.amount };
            }

            if (errors) {
                var data = {
                    success: false,
                    validationErrors: errors
                };
                return res.send(data);
            }
            console.log(req.body);
            workflow.emit('findCategory', req.body.category.toLowerCase());
        });

        workflow.on('findCategory', function (cat) {
            req.app.db.models.ExpenseCategory.findOne({ name: cat }, function (err, ctg) {
                if (err) {
                    return next(err);
                }
                if (!ctg) {
                    var data = {
                        success: false,
                        postErrors: { category: {
                            param: 'category',
                            value: req.body.category,
                            msg: 'Invalid category'
                        }}
                    };
                    return res.send(data);
                }

                workflow.emit('createExpense', ctg._id, ctg.name);
            });
        });

        workflow.on('createExpense', function (catId, catName) {
            var fieldsToSet = {
                user: req.user._id,
                title: req.body.title,
                date: req.body.date,
                amount: parseInt(req.body.amount),
                description: req.body.description || "",
                category: { id: catId, name: catName }
            };

            req.app.db.models.Expense.create(fieldsToSet, function (err, doc) {
                if (err) {
                    return next(err);
                }
                var data = {
                    success: true,
                    expense: doc
                };
                return res.send(data);
            });
        });

        workflow.emit('validate');
    };

    /*
     * GET /cost/expenses?page=pageNumber&&count=itemCount
     */
    this.showExpensesPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "Expenses",
            expensesPage: true,
            googleFonts: false
        };
        return res.render('cost/expenses', data);
    };

    /**
     * GET /cost/trends
     */
    this.showTrendsPage = function (req, res, next) {
        var data = {
            layout: "cost.dashboard.handlebars",
            user: req.user,
            title: "Trends",
            trendsPage: true,
            googleFont: false
        };
        return res.render('cost/trends', data);
    };

    /**
     * GET /cost/budget
     */
    this.showBudgetPage = function (req, res, next) {
        var data = {
            layout: "cost.dashboard.handlebars",
            user: req.user,
            title: "Budget",
            budgetPage: true,
            googleFont: true
        };
        return res.render('cost/budget', data);
    };

    /**
     * GET /cost/people
     */
    this.showPeoplePage = function (req, res, next) {
        var data = {
            activeNav: "people"
        };
        return res.render('cost/people', data);
    };

    /**
     * GET /cost/notifications
     */
    this.showNotificationsPage = function (req, res, next) {
        var data = {
            activeNav: "notifications"
        };
        return res.render("cost/notifications", data);
    };

    /**
     * GET /cost/reminders
     */
    this.showRemindersPage = function (req, res, next) {
        var data = {
            activeNav: "reminders"
        };
        return res.render('cost/reminders');
    };

    /**
     * GET /cost/reports
     */
    this.showReportsPage = function (req, res, next) {
        var data = {
            activeNav: "reports"
        };
        return res.render('cost/reports');
    };

    /**
     * GET /cost/settings
     */
    this.showSettingsPage = function (req, res, next) {
        var data = {
            activeNav: "settings"
        };
        return res.render('cost/settings');
    };

    /**
     * GET /cost/faq
     */
    this.showFaqPage = function (req, res, next) {
        var data = {
            activeNav: "faq"
        };
        return res.render('cost/faq');
    };
};


exports = module.exports = CostHandler;




















