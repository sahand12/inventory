/**
 * Created by MH on 6/6/2015.
 */
var router = require('express').Router();
var ensureAuthenticated = require('../../helpers').isAuthenticated;
var AuthHandler = require('../../controllers/authHandler');
var authHandler = new AuthHandler();

exports = module.exports = function (passport) {

    router.get('/', authHandler.displayLoginPage);
    router.post('/', authHandler.handleLoginRequest);

    router.get('/login', authHandler.displayLoginPage);
    router.post('/login', authHandler.handleLoginRequest);

    router.get('/logout', authHandler.displayLogoutPage);

    router.get('/signup', authHandler.displaySignupPage);
    router.post('/signup', authHandler.handleSignupRequest);

    router.get('/dashboard/', authHandler.displayDashboardPage);

    return router;
};