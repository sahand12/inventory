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
    return res.redirect('/login');
}

function ensureCostAdmin (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('costAdmin')) {
        return next();
    }
    req.session.authorizationError = {
        message: "You don't have permission to see this page",
        requestedUrl: req.originalUrl
    };

    // TODO: make this route and views accordingly
    return res.redirect('/cost/errors/authorization');
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

exports = module.exports = function (express, app, passport) {

    /**
     * ------------------------------------
     *      ROUTES FOR THE WEBSITE
     * ------------------------------------
     */
    var frontEndHandler = new (require('./controllers/website/frontEndHandler'))();

    app.get('/', frontEndHandler.displayHomePage);

    app.get('/products/', frontEndHandler.displayProductsPage);
    app.get('/products/coiled-tubing', frontEndHandler.displayCoiledPage);
    app.get('/products/well-test', frontEndHandler.displayWellTestPage);
    app.get('/products/well-stimulation', frontEndHandler.displayWellStimulationPage);
    app.get('/products/drilling-fluid', frontEndHandler.displayDrillingFluidPage);

    app.get('/about-us/', frontEndHandler.displayAboutPage);
    app.get('/about/safety', frontEndHandler.displaySafetyPage);
    app.get('/about/careers', frontEndHandler.displayCareersPage);
    app.get('/about/ethics', frontEndHandler.displayEthicsPage);
    app.get('/about/corporate-responsibility', frontEndHandler.displayResponsibilityPage);

    app.get('/domains', frontEndHandler.showDomainsPage);
    app.get('/domains/deep-water', frontEndHandler.showDeepWaterPage);
    app.get('/domains/aging-reservoirs', frontEndHandler.showAgingPage);
    app.get('/domains/unconventional', frontEndHandler.showUnconventionalPage);

    app.get('/challenges/', frontEndHandler.displayChallengesPage);
    app.get('/challenges/production-optimization', frontEndHandler.displayProductionOptimizationPage);
    app.get('/challenges/well-integrity', frontEndHandler.displayWellIntegrityPage);
    app.get('/challenges/well-placement', frontEndHandler.displayWellPlacementPage);

    /**
     * -------------------------------------
     *      AUTHENTICATION ROUTES
     * -------------------------------------
     */
    var signupHandler = require('./controllers/authentication/signupHandler');
    app.get('/signup/', signupHandler.init);
    app.post('/signup/', signupHandler.signup);

    // login/out
    var loginHandler = require('./controllers/authentication/loginHandler');
    app.get('/login/', loginHandler.init);
    app.post('/login/', loginHandler.login);
    app.get('/login/forgot/', loginHandler.showForgot);
    app.post('/login/forgot/', loginHandler.sendForgot);
    app.get('/login/reset/', loginHandler.showReset);
    app.get('/login/reset/:email/:token', loginHandler.showReset);
    app.put('/login/reset/:email/:token', loginHandler.setReset);

    // log out handler
    var logoutHandler = require('./controllers/authentication/logoutHandler');
    app.get('/logout/', logoutHandler.init);


    /**
     * ---------------------------------------
     *       COST ROUTES
     * ---------------------------------------
     */
    // dashboard
    //var dashboardHandler = require('./controllers/dashboardHandler');
    //app.get('/sim/dashboard/', ensureAuthenticated, dashboardHandler.init);


    //// goods inventory
    //var GoodHandler = require('./controllers/goodHandler'),
    //    goodHandler = new GoodHandler(app);
    //app.get('/sim/goods/insert', goodHandler.showInsertNewGood);
    //app.post('/sim/goods/insert', goodHandler.handleInsertNewGood);
    //app.get('/sim/goods/list', goodHandler.showAllGoods);
    //app.get('/sim/goods/good/:id', goodHandler.showASingleGood);


    var CostHandler = require('./controllers/cost/costHandler'),
        costHandler = new CostHandler(app);
    app.all('/costs/', ensureAuthenticated);
    app.get('/cost/dashboard', ensureAuthenticated, costHandler.showDashboard);
    app.get('/cost/expenses', ensureAuthenticated, costHandler.showExpensesPage);
    app.post('/cost/expenses', ensureAuthenticated, costHandler.handleAddExpenseRequest);
    app.get('/cost/categories', ensureAuthenticated, costHandler.showCategoriesPage);
    app.get('/cost/reports', ensureAuthenticated, costHandler.showReportsPage);
    app.get('/cost/settings', ensureAuthenticated, costHandler.showSettingsPage);
    app.get('/cost/daily-report', ensureAuthenticated, costHandler.showDailyReportPage);

    // Admin pages
    app.get('/cost/admin/dashboard', ensureCostAdmin, costHandler.showAdminDashboardPage);
    app.get('/cost/admin/expenses', ensureCostAdmin, costHandler.showAdminExpensesPage);
    app.get('/cost/admin/categories', ensureCostAdmin, costHandler.showAdminCategoriesPage);
    app.get('/cost/admin/daily-reports', ensureCostAdmin, costHandler.showAdminDailyReportsPage);
    app.get('/cost/admin/users', ensureCostAdmin, costHandler.showUsersPage);
    app.get('/cost/admin/users/:userId/expenses', ensureCostAdmin, costHandler.showUserExpensesPage);

    var CostApiHandler = require('./controllers/cost/api/costApiHandler'),
        costApiHandler = new CostApiHandler(app);
    app.get('/cost/api/categories', ensureAuthenticated, costApiHandler.findAllCategories);
    app.post('/cost/api/categories', ensureAuthenticated, costApiHandler.handleCreateCategoryRequest);
    app.get('/cost/api/categories/latest', ensureAuthenticated, costApiHandler.findLatestAddedCategories);

    app.get('/cost/api/expenses/category/:categoryName', ensureAuthenticated, costApiHandler.listExpensesByCategory);
    app.get('/cost/api/expenses', ensureAuthenticated, costApiHandler.listExpensesByUser);
    app.get('/cost/api/expenses/total', ensureAuthenticated, costApiHandler.showTotalExpenses);
    app.get('/cost/api/expenses/categories', ensureAuthenticated, costApiHandler.showTotalExpensesByEachCategory);
    app.get('/cost/api/expenses/categories/total', ensureAuthenticated, costApiHandler.getTotalExpensesByEachCategory);
    app.get('/cost/api/expenses/this-year', ensureAuthenticated, costApiHandler.showThisYearExpenses);
    app.get('/cost/api/expenses/count', ensureAuthenticated, costApiHandler.findTotalNumberOfExpenses);
    app.put('/cost/api/expenses', ensureAuthenticated, costApiHandler.handleUpdateExpenseRequest);
    app.delete('/cost/api/expenses', ensureAuthenticated, costApiHandler.handleDeleteExpenseRequest);
    app.get('/cost/api/reports', ensureAuthenticated, costApiHandler.getAllReportsByUser);
    app.post('/cost/api/reports', ensureAuthenticated, costApiHandler.createNewReport);
    app.get('/cost/api/reports/download', ensureAuthenticated, costApiHandler.sendReport);
    app.delete('/cost/api/reports/:id', ensureAuthenticated, costApiHandler.deleteReport);

    // use pagination to get list of expenses
    app.get('/cost/api/expenses/list', ensureAuthenticated, costApiHandler.getPaginatedExpensesByUser);

    // search the expenses for some query
    app.get('/cost/api/expenses/search', ensureAuthenticated, costApiHandler.getSearchExpensesResult);

    // cost admin pages
    app.get('/cost/admin/total-expenses', ensureAuthenticated, ensureCostAdmin, costHandler.showAllExpensesPage);
    app.get('/cost/api/expenses/all', ensureAuthenticated, ensureCostAdmin, costApiHandler.getAllExpenses);



    // Securing static contents
    app.use('/files/reports', ensureAuthenticated);
    app.use('/files/reports', express.static( __dirname + "/files/reports" ));

    /*
     * --------------------------------
     *     PROFILE SETTINGS ROUTES
     * --------------------------------
     */
    var SettingsApiHandler = require('./controllers/cost/api/settingsApiHandler');
    var settingsApiHandler = new SettingsApiHandler(app);

    app.put('/cost/api/settings/:id', ensureAuthenticated, settingsApiHandler.updateUserProfile);

    /*
     * -------------------------------
     *     ADMIN API ROUTES
     * -------------------------------
     */
    var CostAdminApiHandler = require('./controllers/cost/api/costAdminApiHandler');
    var costAdminApiHandler = new CostAdminApiHandler(app);

    // users routes
    app.get('/cost/api/admin/users', ensureCostAdmin, costAdminApiHandler.getAllUsers);
    app.get('/cost/api/admin/users/total-expenses', ensureCostAdmin, costAdminApiHandler.getTotalExpensesForEachUser);
    app.get('/cost/api/admin/users/:id', ensureCostAdmin, costAdminApiHandler.getUserById);
    app.get('/cost/api/admin/users/:userId/expenses', ensureCostAdmin, costAdminApiHandler.getExpensesForAUser);

    // expenses routes
    app.get('/cost/api/admin/expenses', ensureCostAdmin, costAdminApiHandler.getAllExpenses);
    app.get('/cost/api/admin/expenses/total', ensureCostAdmin, costAdminApiHandler.getTotalExpensesAmount);
    app.get('/cost/api/admin/expenses/between', ensureCostAdmin, costAdminApiHandler.getAllExpensesBetweenTwoDates);
    app.get('/cost/api/admin/expenses/categories', ensureCostAdmin, costAdminApiHandler.getAllExpensesGroupedByCategories);

    // categories routes
    app.get('/cost/api/admin/expenses/categories/:name', ensureCostAdmin, costAdminApiHandler.getAllExpensesForACategory);
    app.get('/cost/api/admin/categories', ensureCostAdmin, costAdminApiHandler.getAllCategories);
    app.get('/cost/api/admin/categories/:id/expenses', ensureCostAdmin, costAdminApiHandler.getAllExpensesForACategory);

    // daily reports routes
    app.get('/cost/api/admin/daily-reports', ensureCostAdmin, costAdminApiHandler.getAllDailyReports);


    /*
     * ------------------------------------
     *     DAILY REPORTS ROUTES
     * ------------------------------------
     */
    var DailyReportApiHandler = require('./controllers/cost/api/dailyReportApiHandler');
    var dailyReportApiHandler = new DailyReportApiHandler(app);

    app.get('/cost/api/daily-reports/', ensureCostAdmin, dailyReportApiHandler.getAllDailyReports);
    app.get('/cost/api/user/:userId/daily-reports', ensureCostAdmin, dailyReportApiHandler.getAllDailyReportsForAUser);
    app.post('/cost/api/daily-reports', ensureAuthenticated, dailyReportApiHandler.createNewDailyReport);
    app.get('/cost/api/daily-reports/date/:dateTime', ensureCostAdmin, dailyReportApiHandler.getAllDailyReportsForADay);

};