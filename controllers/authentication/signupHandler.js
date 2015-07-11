'use strict';

exports.init = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/cost/dashboard/');
    }
    var data = {
        layout: "auth.handlebars",
        validationErrors: req.session.validationErrors || "",
        postErrors: req.session.postErrors || "",
        bodyClass: 'register-page',
        title: "Sign up",
        values: req.session.values
    };
    delete req.session.validationErrors;
    delete req.session.postErrors;
    delete req.session.values;
    return res.render('authentication/signup/index', data);
};

exports.signup = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function() {
        req.checkBody('email', 'provide a valid email address').isEmail();
        req.checkBody('firstName', 'enter your first name').notEmpty();
        req.checkBody('lastName', 'enter your last name').notEmpty();
        req.checkBody('password', 'at least 8 characters long').len(8, 20);
        req.checkBody('confirm', 'passwords don\'t match').notEmpty().equals(req.body.password);

        var errors = req.validationErrors(true);
        if (errors) {
            req.session.validationErrors = errors;
            req.session.values = {
                email: req.body.email,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            };
            return res.redirect('/signup');
        }

        workflow.emit('duplicateEmailCheck');
    });

    workflow.on('duplicateEmailCheck', function () {
        req.app.db.models.User.findOne({ email: req.body.email }, function (err, user) {
            if (err) {
                return next(err);
            }

            if (user) {
                req.session.postErrors = { error: "email already registered." };
                return res.redirect('/signup/');
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
       req.app.db.models.User.create(fieldsToSet, function (err, newUser) {
           if (err) {
               return next(err);
           }

           if (newUser) {
               workflow.emit('sendWelcomeEmail');
           }
       });
    });

    workflow.on('sendWelcomeEmail', function () {
        workflow.emit('logUserIn');
    });

    workflow.on('logUserIn', function () {
        req._passport.instance.authenticate('local', function (err, user, info) {
            if (err) {
                return next(err);
            }

            if (!user) {
                req.session.postErrors = { error: 'automatic login failed. please do it manually' };
                return res.redirect('/login');
            }
            else {
                req.login(user, function (err) {
                    if (err) {
                        return next(err);
                    }

                    return res.redirect('/cost/dashboard');
                });
            }
        })(req, res, next);
    });

    workflow.emit('validate');
};