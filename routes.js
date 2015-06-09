/**
 * Created by hamid on 6/8/15.
 */
'use strict';

function ensureAuthenticated (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.set('X-Auth-Required', 'true');
    req.session.returnUrl = req.originalUrl;
    return res.redirect('sim/login/');
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
    var frontEndHandler = new (require('./controllers/frontEndHandler'))();
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
    //app.get('/sim/login/forgot/', loginHandler.displayForgotPage);
    //app.post('/sim/login/forgot/', loginHandler.handleForgotRequest);
    //app.get('/sim/login/reset/', loginHandler.displayResetPage);
    //app.get('/sim/login/reset/:email/:token', loginHandler.handleResetRequest);
    //app.put('/sim/login/reset/:email/:token', loginHandler.handleResetUpdateRequest);

    // log out handler
    var logoutHandler = require('./controllers/logoutHandler');
    app.get('/sim/logout/', logoutHandler.init);

    // dashboard
    var dashboardHandler = require('./controllers/dashboardHandler');
    app.all('/sim/dashboard', ensureAuthenticated);
    app.get('/sim/dashboard/', dashboardHandler.init);

};