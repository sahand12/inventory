'use strict';

exports.init = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/sim/dashboard/');
    }
    var data = {
        validationErrors: req.session.validationErrors || "",
        postErrors: req.session.postErrors || "",
        bodyClass: 'login-page',
        title: "Login"
    };
    delete req.session.validationErrors;
    delete req.session.postErrors;
    res.render('login/index', data);
};

exports.login = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        req.checkBody('email', 'provide a valid email address').isEmail();
        req.checkBody('password', 'password can not be empty').notEmpty();

        var errors = req.validationErrors();
        if (!errors) {
            workflow.emit('abuseFilter');
        }
        else {
            req.session.validationErrors = errors;
            return res.redirect('/sim/login/');
        }
    });

    workflow.on('abuseFilter', function () {
        workflow.emit('attemptLogin');
    });

    workflow.on('attemptLogin', function () {
        req._passport.instance.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                var fieldsToSet = { ip: req.ip, user: req.body.email };
                req.app.db.models.LoginAttempt.create(fieldsToSet, function (err, doc) {
                    if (err) {
                        return next(err);
                    }

                    req.session.postErrors = { error: "Username and password combination not found or your account is inactive." };
                    return res.redirect('/sim/login/');
                });
            }
            else {
                req.login(user, function (err) {
                    if (err) {
                        return next(err);
                    }
                    return res.redirect('/sim/dashboard/');
                });
            }
        })(req, res);
    });

    workflow.emit('validate');
};

exports.showForgot = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/sim/dashboard');
    }
    var data = {
        validationErrors: req.session.validationErrors,
        postErrors: req.session.postErrors,
        bodyClass: 'login-page',
        title: 'Login - Forgot Credentials'
    };
    delete req.session.validationErrors;
    delete req.session.postErrors;
    return res.render('login/forgot/index', data);
};

exports.sendForgot = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        req.checkBody('email', "please provide a valid email address").isEmail();

        var errors = req.validationErrors();
        if (errors) {
            req.session.validationErrors = errors;
            console.log('validation error');
            return res.redirect('/sim/login/forgot');
        }
        console.log('no validation error: emit generateToken');
        workflow.emit('generateToken');
    });

    workflow.on('generateToken', function () {
        var crypto = require('crypto');
        crypto.randomBytes(21, function (err, buf) {
            if (err) {
                return next(err);
            }

            var token = buf.toString('hex');
            req.app.db.models.User.encryptPassword(token, function (err, hash) {
                if (err) {
                    return next(err);
                }
                console.log('genereated token: emit patchUser');
                workflow.emit('patchUser', token, hash);
            });
        });
    });

    workflow.on('patchUser', function (token, hash) {
        var conditions = { email: req.body.email.toLowerCase() };
        var fieldsToSet = {
            resetPasswordToken: hash,
            resetPasswordExpires: Date.now() + 10000000
        };
        req.app.db.models.User.findOneAndUpdate(conditions, fieldsToSet, function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                req.session.postErrors = { error: "We couldn't find you using the information you entered. Please try again." };
                console.log('patch user failed. no such user in the db');
                return res.redirect('/sim/login/forgot');
            }
            console.log('patched the user: emit sendEmail');
            workflow.emit('sendEmail', token, user);
        });
    });

    workflow.on('sendEmail', function (token, user) {
        req.app.utility.sendMail(req, res, {
            from: req.app.config.smtp.from.name + ' <' + req.app.config.smtp.from.address + ">",
            to: user.email,
            subject: "Reset your " + req.app.config.projectName + " password",
            textPath: 'login/forgot/email-text',
            htmlPath: 'login/forgot/email-html',
            locals: {
                email: user.email,
                resetLink: req.protocol + "://" + req.headers.host + "/login/reset/" + user.email + "/" + token + "/",
                projectName: req.app.config.projectName
            },
            success: function (msg) {
                console.log('email success');
                console.log(msg);
                return res.json(msg);
            },
            layout: false,
            error: function (err) {
                console.log('email error');
                console.log(err);
                return res.json('An error occurred during sending the email. Please try again');
            }
        });
    });

    workflow.emit('validate');
};

exports.showReset = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/sim/dashboard');
    }
    return res.render('login/reset/index');
};

exports.setReset = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        req.checkBody('password', 'The password field can not be empty').isEmpty();
        req.checkBody('password', "The password must be between 8 and 20 characters long").len(8, 20);
        req.checkBody('confirm', 'your passwords don\'t match').equals(req.body.password);
        req.checkParams('email', 'We can not identify you, you should use the link that we sent for you in response to your password reset request.').isEmail();
        req.checkParams('token', 'your verification token is wrong. you should use the link that we sent for you in response to your password reset request').len(21, 21);

        var errors = req.validationErrors();
        if (errors) {
            req.session.validationErrors = errors;
            console.log(errors);
            return res.redirect('sim/login/reset');
        }

        console.log('no validation errors: emit findUser');
        workflow.emit('findUser');
    });

    workflow.on('findUser', function () {
        var conditions = {
            email: req.params.email,
            resetPasswordExpires: { $gt: Date.now() }
        };
        req.app.db.models.User.findOne(conditions, function (err, user) {
            if (err) {
                return next(err);
            }

            if (!user) {
                console.log('no such user with the email: ', req.params.email);
                req.session.postErrors = { error: "invalid request" };
                return res.redirect('/sim/login/reset');
            }

            req.app.db.models.User.validatePassword(req.params.token, user.resetPasswordToken, function (err, isValid) {
                if (err) {
                    return next(err);
                }

                if (!isValid) {
                    console.log('the token is not right.');
                    req.session.postErrors = { error: "Invalid request" };
                    return res.redirect('/sim/login/reset');
                }

                console.log('the token was right: emit patchUser');
                workflow.emit('patchUser', user);
            });
        });
    });

    workflow.on('patchUser', function (user) {
        var fieldsToSet = {
            password: req.body.password,
            resetPasswordToken: ""
        };
        req.app.db.models.User.findByIdAndUpdate(user._id, function (err, user) {
            if (err) {
                return next(err);
            }
            console.log('updated the user');
            req.session.resetMessage = { msg: "Your password has been reset." };
            return res.redirect('/sim/login');
        });
    });

    workflow.emit('validate');
};























