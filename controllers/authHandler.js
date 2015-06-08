/**
 * Created by MH on 6/5/2015.
 */

var helpers = require('../helpers'),
    User = require('../schema/user');

function AuthHandler () {

    this.displayLoginPage = function (req, res, next) {
        if (req.user) {
            var redirectUrl = helpers.routeUserByRole(req.user.role);
            res.redirect(redirectUrl);
        }
        var vm = {
            title: 'Log in'
        };
        res.render('sim/login', vm);
    };

    this.handleLoginRequest = function (req, res, next) {
        // get the info from the page
        var conditions = { email: req.body.email };

        // retrieve a user from the database according to the passed input
        User.findOne(conditions, function (err, user) {
            if (err) { return next(err); }

            if (!user) {
                console.log('invalid user', conditions);
                var errors = { login: "Invalid email or password" };
                return res.redirect('/sim/login/');
            }

            // validate the password
            user.verifyPassword(req.body.password, function (err, isEqual) {
                if (err) { return next(err); }

                if (!isEqual) {
                    console.log('invalid password');
                    // the password is wrong
                    var errors = { login: "Invalid email or password" };
                    return res.redirect('/sim/login');
                }

                // user credentials are correct so try to login her
                req.login(user, function (err) {
                    if (err) { return next(err); }
                    return res.redirect('/sim/dashboard');
                });
            });
        });
    };

    this.displaySignupPage = function (req, res, next) {
        var errors = req.session.errors || "";
        delete req.session.errors;
        console.log(errors);
        res.render('sim/signup', { errors: errors });
    };

    this.handleSignupRequest = function (req, res, next) {
        var workflow = require('../utility/workflow')(req, res);

        workflow.on('validate', function () {
            req.assert('firstName', 'please enter your first name').notEmpty();
            req.assert('lastName', 'please enter your last name').notEmpty();
            req.assert('email', 'please provide an email address').notEmpty();
            req.assert('email', 'Please enter a valid email address').isEmail();
            req.assert('password', 'your password msut be between 8 and 20 characters long').len(8, 20);

            var errors = req.validationErrors(true);
            if (errors) {
                req.session.errors = errors;
                return res.redirect('/sim/signup');
            }

            workflow.emit('duplicateEmailCheck');
        });

        workflow.on('duplicateEmailCheck', function () {
            User.findOne({ email: req.body.email }, function (err, user) {
                if (err) { return next(err); };

                if (user) {
                    req.session.errors = { email: "Email: <b>" + req.body.email + "</b> is already registered." };
                    res.redirect('/sim/signup');
                }

                workflow.emit('createUser');
            });
        });

        workflow.on('createUser', function () {
            var fieldsToSet = {
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                'name.first': req.body.firstName,
                'name.last': req.body.lastName,
                role: 'engineer'
            };

            User.create(fieldsToSet, function (err, newUser) {
                if (err) { return next(err); }

                workflow.emit('logUserIn');
            });
        });

        workflow.on('logUserIn', function () {
            req._passport.instance.authenticate('login', function (err, user, info) {
                if (err) { return next(err); }

                if (!user) {
                    // this is strange
                    req.session.errors = { 'login': 'An error occurred during the login process, please try again.' };
                    return res.redirect('/sim/login');
                }
                else {
                    req.login(user, function (err) {
                        if (err) { return next(err); }
                        return res.redirect('/sim/dashboard');
                    });
                }
            })(req, res);
        });

        workflow.emit('validate');
    };

    this.displayDashboardPage = function (req, res, next) {
        res.json(req.user);
    };


    this.handleLogoutRequest = function (req, res, next) {

    };

    this.displayForgotPage = function (req, res, next) {

    };

    this.handleForgotRequest = function (req, res, next) {

    };

    this.displayResetPage = function (req, res, next) {

    };

    this.handleResetRequest = function (req, res, next) {

    };

    this.handleResetUpdateRequest = function (req, res, next) {

    };

}

module.exports = AuthHandler;