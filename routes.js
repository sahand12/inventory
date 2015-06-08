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
    res.redirect('/login/');
}

function ensureEngineer (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('engineer')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    res.redirect('/sim/authError/');
}

function ensureManager (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('manager')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    res.redirect('/sim/authError');
}

function ensureSupervisor (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('supervisor')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    res.redirect('/sim/authError');
}

function ensureOwner (req, res, next) {
    if (req.user && req.user.canPlayRoleOf('owner')) {
        return next();
    }
    req.session.errors = {
        authorization: req.app.config.authorization.errors.message,
        requestedUrl: req.originalUrl
    };
    res.redirect('/sim/authError/');
}

exports = module.exports = function (app, passport) {

    // front end
    var frontEndHandler = new (require('./controllers/frontEndHandler'))();
    app.get('/', frontEndHandler.displayHomePage);
    app.get('/products/', frontEndHandler.displayProductsPage);
    app.get('/domains/', frontEndHandler.displayDomainsPage);
    app.get('/about/', frontEndHandler.displayAboutPage);
    app.get('/challenges/', frontEndHandler.displayChallengesPage);

    // user authentication
    var authHandler = new (require('./controllers/authHandler'))();

    // sign up
    app.get('/sim/signup/', authHandler.displaySignupPage);
    app.post('/sim/signup/', authHandler.handleSignupRequest);

    // login/out
    app.get('/sim/login/', authHandler.displayLoginPage);
    app.post('/sim/login/', authHandler.handleLoginRequest);
    app.get('/sim/login/forgot/', authHandler.displayForgotPage);
    app.post('/sim/login/forgot/', authHandler.handleForgotRequest);
    app.get('/sim/login/reset/', authHandler.displayResetPage);
    app.get('/sim/login/reset/:email/:token', authHandler.handleResetRequest);
    app.put('/sim/login/reset/:email/:token', authHandler.handleResetUpdateRequest);
    app.get('/sim/logout/', authHandler.handleLogoutRequest);

};



































