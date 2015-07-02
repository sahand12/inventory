/**
 * Created by hamid on 6/8/15.
 */
'use strict';

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.xhr) {
        return res.send({
            success: false,
            postErrors: "not logged in"
        });
    }
    res.set('X-Auth-Required', 'true');
    req.session.returnUrl = req.originalUrl;
    return res.redirect('/sim/login');
}

function ensureEngineer (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('engineer')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    return res.redirect('/sim/authError/');
}

function ensureManager (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('manager')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    return res.redirect('/sim/authError');
}

function ensureSupervisor (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('supervisor')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    return res.redirect('/sim/authError');
}

function ensureOwner (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('owner')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    return res.redirect('/sim/authError/');
}

exports = module.exports = function (app, passport) {

    // front end
    var frontEndHandler = new (require('./controllers/website/frontEndHandler'))();
    app.get('/', frontEndHandler.displayHomePage);
    app.get('/products/', frontEndHandler.displayProductsPage);
    app.get('/domains/', frontEndHandler.displayDomainsPage);
    app.get('/about/', frontEndHandler.displayAboutPage);
    app.get('/challenges/', frontEndHandler.displayChallengesPage);

    // sign up
    var signupHandler = require('./controllers/signupHandler');
    app.get('/sim/signup/', signupHandler.init);
    app.post('/sim/signup/', signupHandler.signup);

    // login/out
    var loginHandler = require('./controllers/loginHandler');
    app.get('/sim/login/', loginHandler.init);
    app.post('/sim/login/', loginHandler.login);
    app.get('/sim/login/forgot/', loginHandler.showForgot);
    app.post('/sim/login/forgot/', loginHandler.sendForgot);
    app.get('/sim/login/reset/', loginHandler.showReset);
    app.get('/sim/login/reset/:email/:token', loginHandler.showReset);
    app.put('/sim/login/reset/:email/:token', loginHandler.setReset);

    // log out handler
    var logoutHandler = require('./controllers/logoutHandler');
    app.get('/sim/logout/', logoutHandler.init);

    // dashboard
    var dashboardHandler = require('./controllers/dashboardHandler');
    app.get('/sim/dashboard/', ensureAuthenticated, dashboardHandler.init);


    // goods inventory
    var GoodHandler = require('./controllers/goodHandler'),
        goodHandler = new GoodHandler(app);
    app.get('/sim/goods/insert', goodHandler.showInsertNewGood);
    app.post('/sim/goods/insert', goodHandler.handleInsertNewGood);
    app.get('/sim/goods/list', goodHandler.showAllGoods);
    app.get('/sim/goods/good/:id', goodHandler.showASingleGood);


    var CostHandler = require('./controllers/costHandler'),
        costHandler = new CostHandler(app);
    app.all('/costs/', ensureAuthenticated);
    app.get('/cost/dashboard', ensureAuthenticated, costHandler.showDashboard);
    app.post('/cost/expenses', ensureAuthenticated, costHandler.handleAddExpenseRequest);
    app.get('/cost/expenses', ensureAuthenticated, costHandler.showExpensesPage);

    var CostCategoryHandler = require('./controllers/cost/categoryHandler'),
        costCategoryHandler = new CostCategoryHandler(app);
    app.get('/cost/categories', ensureAuthenticated, costCategoryHandler.showCategories);
    app.post('/cost/categories', ensureAuthenticated, costCategoryHandler.handleAddCategoryRequest);

    var CostApiHandler = require('./controllers/cost/api/costApiHandler'),
        costApiHandler = new CostApiHandler(app);
    app.get('/cost/api/categories', ensureAuthenticated, costApiHandler.findAllCategoriesByUser);
    app.post('/cost/api/categories', ensureAuthenticated, costApiHandler.handleCreateCategoryRequest);
    app.get('/cost/api/categories/latest', ensureAuthenticated, costApiHandler.findLatestAddedCategories);
    app.get('/cost/api/expenses/category/:categoryName', ensureAuthenticated, costApiHandler.listExpensesByCategory);
    app.get('/cost/api/expenses', ensureAuthenticated, costApiHandler.listExpensesByUser);
    app.get('/cost/api/expenses/total', ensureAuthenticated, costApiHandler.showTotalExpenses);
    app.get('/cost/api/expenses/categories', ensureAuthenticated, costApiHandler.showTotalExpensesByEachCategory);
    app.get('/cost/api/expenses/this-year', ensureAuthenticated, costApiHandler.showThisYearExpenses);
    app.get('/cost/api/expenses/count', ensureAuthenticated, costApiHandler.findTotalNumberOfExpenses);
    app.put('/cost/api/expenses', ensureAuthenticated, costApiHandler.handleUpdateExpenseRequest);
    app.delete('/cost/api/expenses', ensureAuthenticated, costApiHandler.handleDeleteExpenseRequest);

    app.get('/cost/expenses', ensureAuthenticated, costHandler.showExpensesPage);
    app.get('/cost/trends', ensureAuthenticated, costHandler.showTrendsPage);
    app.get('/cost/budget', ensureAuthenticated, costHandler.showBudgetPage);
    app.get('/cost/people', ensureAuthenticated, costHandler.showPeoplePage);
    app.get('/cost/notifications', ensureAuthenticated, costHandler.showNotificationsPage);
    app.get('/cost/reminders', ensureAuthenticated, costHandler.showRemindersPage);
    app.get('/cost/reports', ensureAuthenticated, costHandler.showReportsPage);
    app.get('/cost/settings', ensureAuthenticated, costHandler.showSettingsPage);
    app.get('/cost/faq', ensureAuthenticated, costHandler.showFaqPage);


};