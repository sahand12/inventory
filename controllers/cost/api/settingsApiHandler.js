//    controllers/cost/api/settingsApiHandler.js
"use strict";

var objectId = require('mongodb').ObjectID;

var SettingsApiHandler = function (app) {

    /**
     * @var Object - A reference to the Users collection
     */
    var Users = app.db.models.User;

    /**
     *  GET    /cost/api/settings/profile
     */
    this.getUserProfile = function (req, res, next) {
        var id = req.user._id;

        Users.findById(id, function (err, doc) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    getErrors: { error: 'database error' }
                });
            }
            if (!doc) {
                return res.send({
                    success: false,
                    getErrors: { error: 'no such user with the specified id' }
                });
            }
            return res.send({
                success: true,
                data: doc
            });
        });
    };


    /**
     * PUT    /cost/api/settings/profile
     */
    this.updateUserProfile = function (req, res, next) {

        var workflow = app.utility.workflow(req, res);
        console.log(req.body);
        var updateBranch = req.query.type;
console.log(req.query);
console.log(req.params);
        workflow.on('validate', function () {
            switch ( updateBranch ) {
                case 'profile':
                    workflow.emit('validateProfile');
                    break;
                case 'password':
                    workflow.emit('validatePassword');
                    break;
                case 'others':
                    workflow.emit('validateOthers');
                    break;
                default:
                    workflow.emit('error');
            }
        });

        workflow.on('error', function () {
           return res.send({
               success: false,
               validationErrors: { error: 'invalid update type' }
           })
        });

        workflow.on('validateProfile', function () {
            req.checkBody('profileFirstName', 'please, provide a first name.').notEmpty();
            req.checkBody('profileLastName', 'please, provide a last name.').notEmpty();
            req.checkBody('profileEmail', 'please, provide a valid email').isEmail();

            var errors = req.validationErrors(true);

            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: errors
                });
            }

            var fieldsToUpdate = {
                'name.first': req.body['profileFirstName'],
                'name.last': req.body['profileLastName'],
                'email': req.body['profileEmail']
            };

            workflow.emit('findUserAndUpdate',fieldsToUpdate);
        });

        workflow.on('validatePassword', function () {
            console.log('err', req.body['profileCurrentPassword'], req.user.password);
            Users.validatePassword(req.body['profileCurrentPassword'], req.user.password, function (err, isValid) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                if (!isValid) {
                    return res.send({
                        success: false,
                        passwordError: { error: 'wrong password' }
                    });
                }
                workflow.emit('validateNewPassword');
            });
        });

        workflow.emit('validateNewPassword', function () {
            req.checkBody('newPassword', 'Password should be at least 8 characters long.').len(8, 30);
            req.checkBody('confirmPassword', 'Password don\'t match').equals(req.body['newPassword']);

            var errors = req.validationErrors(true);
            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: errors
                });
            }

            workflow.emit('updatePassword', req.body['newPassword']);
        });

        workflow.on('updatePassword', function (newPass) {
            Users.findOne({ _id: req.user._id }, function (err, user) {
                if (err) {
                    console.log(err);
                    return res.send( {
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                if (!user) {
                    console.log('this is weird no user');
                    return res.send({
                        success: false,
                        postErrors: { error: 'invalid request' }
                    });
                }

                // set the new pass
                user.password = newPass;
                user.save(function (err) {
                    if (err) {
                        return res.send({
                            success: false,
                            postErrors: { error: 'database error' }
                        });
                    }
                    return res.send({
                        success: true
                    });
                });
            });
        });

        workflow.on('findUserAndUpdate', function (fieldsToUpdate) {
            Users.findOne({ _id: req.user._id }, function (err, doc) {
                if (err) {
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                if (!doc) {
                    console.log('this is weird why no user????');
                    return res.send({
                        success: false,
                        postErrors: { error: 'invalid request' }
                    });
                }

                // set the new fields
                doc.name.first = req.body['profileFirstName'];
                doc.name.last = req.body['profileLastName'];
                doc.email = req.body['profileEmail'];

                doc.save(function (err, doc) {
                    if (err) {
                        return res.send({
                            success: false,
                            postErrors: { error: 'database error' }
                        });
                    }
                    return res.send({
                        success: true,
                        data: doc
                    });
                });
            });
        });

        workflow.emit('validate');
    };


    /*
     *
     */
};

exports = module.exports = SettingsApiHandler;