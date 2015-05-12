// passport/init.js

var login  = require('./login'),
    signup = require('./signup'),
    User   = require('../models/user');

module.exports = function (passport) {

    // Passport needs to be able to serialize users to suppoert
    // persistent login sessions
    passport.serializeUser(function (user, done) {
        console.log('serializing user: \n', user);
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            console.log('deserializing user; ', user);
            done(err, user);
        });
    });

    login(passport);
    signup(passport);

};