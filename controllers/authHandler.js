/**
 * Created by MH on 6/5/2015.
 */

var helpers = require('../helpers'),
    User = require('../models/user');

function AuthHandler () {

    this.displayLoginPage = function (req, res, next) {
        if (req.user) {
            var redirectUrl = helpers.routeUserByRole(req.user.role);
            res.redirect(redirectUrl);
        }
        var vm = {
            title: 'Log in'
        };
        res.render('sim/login');
    };

    this.handleLoginRequest = function (req, res, next) {
        // get the info from the page
        var conditions = { email: req.body.email };

        // retrieve a user from the database according to the passed input
        User.findOne(conditions, function (err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                console.log('invalid user', conditions);
                var errors = { login: "Invalid email or password" };
                return res.redirect('/sim/login/');
            }

            // validate the password
            user.verifyPassword(req.body.password, function (err, isEqual) {
                if (err) {
                    return next(err);
                }
                if (!isEqual) {
                    console.log('invalid password');
                    // the password is wrong
                    var errors = { login: "Invalid email or password" };
                    return res.redirect('/sim/login');
                }

                // user credentials are correct so try to login her
                req.login(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/sim/dashboard');
                });
            });
        });

    };

    this.displaySignupPage = function (req, res, next) {
        res.render('sim/signup');
    };

    this.handleSignupRequest = function (req, res, next) {
        var userInfo = {
            email: req.body.email,
            password: req.body.password,
            'name.first': req.body.firstName,
            'name.last': req.body.lastName,
            role: 'engineer'
            },
            errors = {};

        // validate input
        helpers.validateUser(userInfo, errors);
        if ( Object.keys(errors).length !== 0) {
            res.render('sim/signup', errors);
        }

        // hash the password
        userInfo.password = User.hashPassword(userInfo.password);

        // inputs are valid so lets create a user model using mongoose
        var newUser = new User(userInfo);
        newUser.save(function (err, savedUser) {
            if (err) {
                console.log(err);
            }
            else {
                console.log(savedUser);
                res.json(savedUser);
            }
        });

        // insert it to the database

        // loging it to the system
    };


    this.displayDashboardPage = function (req, res, next) {
        res.json(req.user);
    };
}

module.exports = AuthHandler;