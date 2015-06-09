/**
 * Created by MH on 6/5/2015.
 */
'use strict';

var getReturnUrl = function(req) {
    var returnUrl = req.user.defaultReturnUrl();
    if (req.session.returnUrl) {
        returnUrl =
            req.session.returnUrl;
        delete req.session.returnUrl;
    }
    return returnUrl;
};

function AuthHandler() {

    this.displayLoginPage = function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect(getReturnUrl(req));
        } else {
            var data = {
                errors: req.session.errors
            };
            delete req.session.errors;
            res.render('login/index', data);
        }
    };

    /*this.handleLoginRequest = function (req, res, next) {
        req.app.db.models.LoginAttempt.count({}, function (err, count) {
            console.log(count);
            res.json({ count: count });
        });
    };*/

    this.handleLoginRequest = function(req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function() {
            req.checkBody('email', "You should enter your email address").notEmpty();
            req.checkBody('email', 'You should enter a valid email address').isEmail();
            req.checkBody('password', 'You should enter your password').notEmpty();

            var errors = req.validationErrors();
            if (!errors) {
                console.log('no error in validation: emit abuseFilter');
                workflow.emit('abuseFilter');
            } else {
                req.session.errors =
                    errors;
                console.log('errors in validation: redirect to /sim/login');
                //console.dir(req.app.db.models);
                workflow.emit('redirect', '/sim/login/');
            }
        });

        workflow.on('abuseFilter', function() {
            req.app.db.models.LoginAttempt.count({ ip: req.ip }, function (err, count) {
                if (err) { return next(err); }

                if (count >= req.app.config.loginAttempts.forIp) {
                    req.session.errors = { 'login attempt': "You've reached the maximum number of login attempts. Please try again later." };
                    workflow.emit('redirect', '/sim/login/');
                }
                else {
                    console.log('abuseFilter: emit attemptLogin');
                    workflow.emit('attemptLogin');
                }
            })
        });

        workflow.on('attemptLogin', function() {
            req._passport.instance.authenticate('local', function(err, user, info) {
                if (err) {
                    return next(err);
                }

                if (!user) {
                    var fieldsToSet = {
                        ip: req.ip,
                        user: req.body.username
                    };
                    req.app.db.models.LoginAttempt.create(fieldsToSet, function(err, doc) {
                        if (err) {
                            return next(err);
                        }

                        req.session.errors = {
                            'login credentials': 'Username and password combination not found or your account is inactive.'
                        };
                        console.log('credential errors: redirect to /sim/login');
                        return workflow.emit('redirect', '/sim/login');
                    });
                } else {
                    req.login(user, function(err) {
                        if (err) {
                            console.log('req.login error: ', err);
                            return next(err);
                        }

                        console.log('successful login: redirect to sim/dashboard');
                        workflow.redirect('/sim/dashboard/');
                    });
                }
            })(req, res);
        });

        workflow.emit('validate');
    };

    this.displaySignupPage = function(req, res, next) {
        if (req.isAuthenticated()) {
            return res.redirect(req.user.defaultReturnUrl());
        }
        var data = {
            validationErrors: req.session.validationErrors || "",
            postErrors: req.session.postErrors || ""
        };
        delete req.session.validationErrors;
        delete req.session.postErrors;
        console.log(data);
        return res.render('signup/index', data);
    };

    this.handleSignupRequest = function(req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function() {
            req.assert('firstName', 'please enter your first name').notEmpty();
            req.assert('lastName', 'please enter your last name').notEmpty();
            req.assert('email', 'please provide an email address').notEmpty();
            req.assert('email', 'Please enter a valid email address').isEmail();
            req.assert('password', 'your password must be between 8 and 20 characters long').len(8, 20);

            var errors = req.validationErrors(true);
            if (errors) {
                req.session.validationErrors = errors;
                return res.redirect('/sim/signup');
            }

            console.log('no validation error: emit duplicateEmailCheck');
            workflow.emit('duplicateEmailCheck');
        });

        workflow.on('duplicateEmailCheck', function() {
            req.app.db.models.User.findOne({ email: req.body.email.toLowerCase() }, function (err, user) {
                if (err) { return next(err); }
                if (user) {
                    req.session.postErrors = { error: 'email already registered.' };
                    return workflow.emit('redirect', '/sim/signup');
                }
                console.log('the email is unique: emit createUser');
                workflow.emit('createUser');
            });
        });

        workflow.on('createUser', function() {
            var fieldsToSet = {
                email: req.body.email.toLowerCase(),
                password: req.body.password,
                'name.first': req.body.firstName,
                'name.last': req.body.lastName,
                role: 'engineer'
            };

            req.app.db.models.User.create(fieldsToSet, function(err, newUser) {
                if (err) {
                    return next(err);
                }

                console.log('created the user: emit send Welcome mail');
                workflow.user = newUser;
                workflow.emit('sendWelcomeEmail');
            });
        });

        workflow.on('sendWelcomeEmail', function () {
            console.log('sent the welcome mail, emit logUserIn');
            workflow.emit('logUserIn');
        });

        workflow.on('logUserIn', function() {
            req._passport.instance.authenticate('local', function (err, user, info) {
                if (err) return next(err);

                if (!user) {
                    req.session.errors = { 'login error': 'Login failed.' };
                    console.log('logUserIn: there was no such a user in the database');
                    return workflow.emit('redirect', '/sim/login');
                }
                else {
                    req.login(user, function (err) {
                        console.log('req.login error', err);
                        console.log('req.user', req.user);
                        if (err) { return next(err); }
                        return workflow.emit('redirect', '/sim/dashboard/');
                    });
                }
            })(req, res);
        });

        workflow.emit('validate');
    };

    this.displayDashboardPage = function(req, res, next) {
        return res.json(req.user);
    };


    this.handleLogoutRequest =
        function(req, res, next) {

        };

    this.displayForgotPage =
        function(req, res, next) {

        };

    this.handleForgotRequest =
        function(req, res, next) {

        };

    this.displayResetPage =
        function(req, res, next) {

        };

    this.handleResetRequest =
        function(req, res, next) {

        };

    this.handleResetUpdateRequest =
        function(req, res, next) {

        };

}

module.exports =
    AuthHandler;
