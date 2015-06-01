// passport/signup.js

var LocalStrategy = require('passport-local').Strategy,
    bcrypt        = require('bcrypt'),
    User          = require('../models/user');

module.exports = function (passport) {

    passport.use('signup', new LocalStrategy({
            passReqToCallback: true
        }, function(req, username, password, done){

            var findOrCreateUser = function() {
                // Find a user in mongo with provided username
                User.findOne({ username: username }, function (err, user) {
                    // In case of error, return using the done method
                    if (err) {
                        console.log('Error in signup: ', err);
                        return done(err);
                    }

                    // Already exists
                    if (user) {
                        console.log('User already exists with username: ', username);
                        return done(null, false, req.flash('message', 'User already exists'));
                    }
                    else {
                        // If there is no user with that username
                        // Create the user
                        var newUser = new User();

                        // set the user's local credentials
                        newUser.firstName = req.body['firstName'];
                        newUser.lastName  = req.body['lastName'];
                        newUser.username  = username;
                        newUser.password  = bcrypt.hashSync(password, 10);
                        newUser.email     = req.body['email'];

                        // Save the user
                        newUser.save(function (err, user) {
                            if (err) {
                                console.log('Error in saving the user: ', err);
                                return done(err);
                            }
                            console.log('User registration successful');
                            return done(null, user);
                        });
                    }
                });
            };

            // Delay the execution of findOrCreateUser and execute the method
            // in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );

};