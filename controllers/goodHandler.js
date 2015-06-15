/**
 * Created by hamid on 6/13/15.
 */
'use strict';

var GoodHandler = function (app) {

    var GoodService = require('../services/goodService'),
        goodService = new GoodService(app);

    /**
     * Route Handler for:
     *     GET    /sim/goods/
     */
    this.showAllGoods = function (req, res, next) {
        req.app.db.models.Good.listAll({}, function (err, goods) {
            if (err) {
                return next(err);
            }
            return res.json(goods);
        });
    };

    /**
     * Route Handler for :
     *     GET    /sim/goods/insert
     */
    this.showInsertNewGood = function (req, res, next) {
        return res.render('goods/insert');
    };

    /**
     * Router Handler for:
     *     POST    /sim/goods/insert
     */
    this.handleInsertNewGood = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('type', 'Type field can not be empty').notEmpty();
            req.checkBody('name', 'Name filed can not be empty').notEmpty();
            req.checkBody('producer', 'Producer field can not be empty').notEmpty();
            req.checkBody('department', 'Department field can not be empty').notEmpty();
            req.checkBody('assetNumber', 'Asset Number field can not be empty').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                req.session.validationErrors = errors;
                return res.redirect('/sim/goods/insert');
            }
            workflow.emit('checkDuplicateAssetNumber', req.body.assetNumber);
        });

        workflow.on('checkDuplicateAssetNumber', function (assetNumber) {
            req.app.db.models.Good.findOne({ assetNumber: assetNumber }, function (err, good) {
                if (err) {
                    return next(err);
                }
                if (good) {
                    req.session.postErrors = { error: "There is an item with the same asset number already in the inventory" };
                    console.log('duplicate asset number error', good);
                    return res.redirect('/sim/goods/insert');
                }
                workflow.emit('createGood');
            });
        });

        workflow.on('createGood', function() {
            var fieldsToSet = {
                type: req.body.type,
                name: req.body.name,
                assetNumber: req.body.assetNumber,
                size: req.body.size,
                color: req.body.color || "",
                producer: req.body.producer,
                department: req.body.department,
                description: req.body.description || ""
            };

            req.app.db.models.Good.create(fieldsToSet, function (err, newGood) {
                if (err) {
                    return next(err);
                }
                return res.json(newGood);
            });
        });

        workflow.emit('validate');
    };

    /**
     * Router handler for:
     *     DELETE     /sim/goods/delete/
     */
    this.deleteGood = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('id', 'an id should be provided to perform a delete request').notEmpty();

            var errors = req.validationErrors();
            if (errors) {
                req.session.deleteErrors = { error: "Invalid delete request" };
                return res.redirect('/sim/goods/status');
            }

            workflow.emit('deleteGood', req.params.id);
        });

        workflow.on('findGood', function (id) {
            req.app.db.models.Good.findOne(id).remove(function (err) {
                if (err) {
                    return next(err);
                }
                req.session.requestMsg = { success: "The requested item successfully deleted from the system" };
                return res.redirect('/sim/goods/list');
            });
        });

        workflow.emit('validate');
    };

    /**
     * Route handler for:
     *     GET    /sim/goods/:id
     */
    this.showASingleGood = function (req, res, next) {
        // check req.params.id is a valid object id
        var id = req.params.id;
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            req.session.getMsg = { error: "invalid request" };
            return res.render('http/404');
        }

        req.app.db.models.Good.findOne({ "_id": req.params.id }, function (err, good) {
            if (err) {
                return next (err);
            }
            if (!good) {
                req.session.requestMsg = { getFailure: "Could not find the requested good" };
                return res.redirect('/sim/goods/list');
            }
            var data = { good: good };
            return res.render('goods/singleGood', data);
        });
    };

    /**
     * route handler for:
     *
     */


};

exports = module.exports = GoodHandler;































