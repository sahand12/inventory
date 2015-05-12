// routes/sim/index.js

/**
 * Created by MH on 5/11/2015.
 */

var express = require('express'),
    router = express.Router();

var isAuthenticated = require('../../helpers').isAuthenticated;

module.exports = function (passport) {

    router.get('/login', function (req, res, next) {
        if (req.user) {
            return res.redirect('/sim/profile');
        }
        var vm = {
            title: "Climax | Login",
            message: req.flash('message')
        };
        res.render('sim/login', vm);
    });

    router.post('/login', passport.authenticate('login', {
        successRedirect: '/sim/profile',
        failureRedirect: '/sim/login',
        failureFlash: true
    }));

    router.get('/signup', function (req, res, next) {
        if (req.user) {
            return res.redirect('/profile');
        }
        var vm = {
            message: req.flash('message'),
            title: "Climax | Signup"
        };
        res.render('sim/signup', vm);
    });

    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/sim/profile',
        failureRedirect: '/sim/signup',
        failureFlash: true
    }));

    router.get('/profile', isAuthenticated, function (req, res, next) {
        var vm = {
            user: req.user,
            title: "Climax | Profile"
        };
        console.log("/profile route, ", req.user);
        console.log("/profile route session: ", req.session);
        res.json(vm.user);
    });

    router.get('/logout', function (req, res, next) {
        req.logout();
        res.render('sim/logout');
    });

    // Must return router from this module
    return router;
};