/**
 * Created by hamid on 6/8/15.
 */
'use strict';

exports = module.exports = function (app, passport) {
    var LocalStrategy = require('passport-local').Strategy;

    passport.use('local', new LocalStrategy(
        { usernameField: 'email', passReqToCallback: true },
        function (req, email, password, done) {
            var conditions = { email: email };

            app.db.models.User.findOne(conditions, function (err, user) {
                if (err) { return done(err); }

                if (!user) {
                    return done(null, false, { 'message': 'Unknown user' });
                }

                app.db.models.User.validatePassword(password, user.password, function (err, isValid) {
                    if (err) { return done(err); }

                    if (!isValid) {
                        return done(err, false, { message: "Invalid password" });
                    }

                    return done(null, user);
                });
            });
    }));

    passport.serializeUser(function (user, done) {
        return done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        app.db.models.User.findOne({ _id: id }, function (err, user) {
            done(err, user);
        });
    });
};