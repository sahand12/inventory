// passport/login.js
var LocalStrategy = require('passport-local').Strategy,
    User          = require('../models/user'),
    bcrypt        = require('bcrypt');

module.exports = function (passport) {

    passport.use('login', new LocalStrategy({
            passReqToCallback: true
        },
        function (req, username, password, done) {
            // Check in mongo if a user with username exists or not
            User.findOne({ username: username }, function (err, user){
                // In case of any error, return using the done method
                if (err) { return done(err); }

                // Username does not exist, log the error and redirect back
                if (!user) {
                    console.log('User not found with username: ', username);
                    return done(null, false, req.flash('message', 'User not found.'));
                }

                // User exists but wrong password, lot the error
                if (!user.verifyPassword(password)) {
                    console.log('Invalid password for username: ', username);
                    // console.log(Object.getPrototypeOf(user));
                    return done(null, false, req.flash('message', "Invalid password"));
                }

                // User and password both match, return user from done method
                // which will be treated like success
                return done(null, user);
            });
        }
    ));
};