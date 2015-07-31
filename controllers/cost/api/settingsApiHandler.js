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

        workflow.on('validate', function () {
            req.check
        })
    }
};

exports = module.exports = SettingsApiHandler;