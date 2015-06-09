'use strict';

exports.init = function (req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/sim/dashboard/');
    }
    var data = {
        validationErrors: req.session.validationErrors || "",
        postErrors: req.session.postErrors || ""
    };
    delete req.session.validationErrors;
    delete req.session.postErrors;
    console.log(data);
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


























