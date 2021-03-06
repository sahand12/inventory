/**
 * Created by sahand on 6/19/15.
 */
"use strict";

function formatDateForInput (date) {
    return new Date(date).toISOString().substring(0, 10);
}

var CostHandler = function CostHandler (app) {

    /*
     * GET /cost/dashboard
     */
    this.showDashboard = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            costAdmin: (req.user.role === 'costAdmin'),
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
            costAdmin: (req.user.role === 'costAdmin'),
            user: req.user,
            title: "Expenses",
            expensesPage: true,
            googleFonts: true
        };
        return res.render('cost/expenses', data);
    };

    /*
     * GET     /cost/admin/total-expenses
     */
    this.showAllExpensesPage = function (req, res, next) {
        var data = {
            adminExpensesPage: true,
            costAdmin: true,
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "All Expenses"
        };
        return res.render('cost/total-expenses', data);
    };

    /**
     * GET /cost/categories
     */
    this.showCategoriesPage = function (req, res, next) {
        var data = {
            layout: "cost.dashboard.handlebars",
            costAdmin: (req.user.role === 'costAdmin'),
            user: req.user,
            title: "Expense Categories",
            categoriesPage: true,
            date: {
                today: new Date(Date.now() + 1000 * 3600 * 4.5).toISOString().substring(0, 10),
                lastMonth: new Date( Date.now() - 1000 * 60 * 60 * 24 * 30 ).toISOString().substring(0, 10)
            }
        };
        return res.render('cost/categories', data);
    };


    /*
     * GET     /cost/reports
     */
    this.showReportsPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "Reports",
            reportsPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };

        return res.render('cost/reports', data);
    };


    /**
     * GET    /cost/settings
     */
    this.showSettingsPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Settings',
            settingsPage: true,
            userJson: JSON.stringify(req.user),
            costAdmin: (req.user.role === 'costAdmin')
        };

        return res.render('cost/settings-page', data);
    };


    /**
     * GET     /cost/daily-reports
     */
    this.showDailyReportPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Daily Reports',
            dailyReportPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };

        return res.render('cost/dailyReports-page', data);
    };


    /*
     * ------------------------------------
     *       ADMIN PAGES
     * ------------------------------------
     */
    // GET     /cost/admin/dashboard
    this.showAdminDashboardPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin Dashboard',
            AdminDashboardPage: true,
            adminPages: true,
            costAdmin: (req.user.role === 'costAdmin')
        };
        return res.render('cost/admin/dashboard-page', data);
    };

    // GET     /cost/admin/expenses
    this.showAdminExpensesPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin | Expenses',
            adminPages: true,
            adminExpensesPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };
        return res.render('cost/admin/expenses-page', data);
    };

    // GET    /cost/admin/categories
    this.showAdminCategoriesPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin | Categories',
            adminPages: true,
            adminCategoriesPage: true,
            costAdmin: (req.user.role === 'costAdmin'),
            date: {
                today: formatDateForInput(Date.now()),
                lastMonth: formatDateForInput(Date.now() - 1000 * 3600 * 24 * 30)
            }
        };
        return res.render('cost/admin/categories-page', data);
    };

    // GET     /cost/admin/daily-reports
    this.showAdminDailyReportsPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin | Daily Reports',
            adminPages: true,
            adminDailyReportsPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };
        return res.render('cost/admin/dailyReports-page', data);
    };

    // GET     /cost/admin/users/:userId/daily-reports
    this.showAdminDailyReportsForAUserPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            adminPages: true,
            adminUserDailyReportsPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };

        req.app.db.models.User.findOne({ _id: req.params.userId }).exec(function (err, user) {
            if (err) {
                return next(err);
            }
            data.title = "Admin | " + user.name.first + " " + user.name.last + " Daily Reports";
            data.reportsOwner = user;
            return res.render('cost/admin/userDailyReports-page', data);
        });
    };

    // GET     /cost/admin/users
    this.showUsersPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin | Users',
            adminPages: true,
            adminUsersPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };
        return res.render('cost/admin/users-page', data);
    };

    // GET     /cost/admin/users/:userId/expenses
    this.showUserExpensesPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: 'Admin | User Expenses',
            adminPages: true,
            adminUserExpensesPage: true,
            costAdmin: (req.user.role == 'costAdmin')
        };
        req.app.db.models.User.findOne({ _id: req.params.userId }).exec(function (err, user) {
            if (err) {
                return next(err);
            }
            data.expensesOwner = user;
            return res.render('cost/admin/userExpenses-page', data);
        });
    };

    // GET     /cost/admin/users/:userId/daily-reports
    this.showUserDailyReportsPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            adminPages: true,
            adminUserDailyReportsPage: true,
            costAdmin: (req.user.role === 'costAdmin')
        };
        req.app.db.models.User.findOne({ _id: req.params.userId }).exec(function (err, user) {
            if (err) {
                return next(err);
            }
            data.title = "Admin | " + user.name.first + " " + user.name.last + " | Daily Reports";
            data.reportsOwner = user;
            return res.render('cost/admin/userDailyReports-page', data);
        });
    };

    // GET     /cost/admin/categories/:categoryId
    this.showSingleCategoryPage = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "Admin | " + req.params.categoryName + " Expenses",
            adminPages: true,
            adminSingleCategoryPage: true,
            costAdmin: (req.user.role === 'costAdmin'),
            categoryName: req.params.categoryName,
            date: {
                today: formatDateForInput(Date.now()),
                lastMonth: formatDateForInput(Date.now() - 1000 * 3600 * 24 * 30)
            }
        };
        return res.render('cost/admin/singleCategory-page', data);
    }

};


exports = module.exports = CostHandler;