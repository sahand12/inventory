/**
 * Created by hamid on 6/13/15.
 */
'use strict';

exports.showInsertNewGood = function (req, res, next) {
    return res.render('goods/insert');
};

exports.handleInsertNewGood = function (req, res, next) {
    var workflow = req.app.utility.workflow(req, res);

    workflow.on('validate', function () {
        req.checkBody('type', 'Type field can not be empty').notEmpty();
        req.checkBody('name', 'Name field can not be empty').notEmpty();
        req.checkBody('producer', 'Producer field can not be empty').notEmpty();
        req.checkBody('department', 'Department can not be empty').notEmpty();

        var errors = req.validationErrors();
        if (errors) {
            req.session.validationErrors = errors;
            return res.json(errors);
            return res.redirect('/sim/goods/insert');
        }

        workflow.emit('checkDuplicateAssetNumber');
    });

    workflow.on('checkDuplicateAssetNumber', function () {
        req.app.db.models.Good.findOne({ assetNumber: req.body.assetNumber }, function (err, good) {
            if (err) {
                return next(err);
            }

            if (good) {
                req.session.postErrors = { error: 'There is an item with this asset number already in the invenotry' };
                console.log('duplicate asset number error', good);
                return res.redirect('/sim/goods/insert');
            }

            workflow.emit('createGood');
        });
    });

    workflow.on('createGood', function () {
        var fieldsToSet = {
            type: req.body.type,
            name: req.body.name,
            assetNumber: req.body.assetNumber || "",
            size: req.body.size || "",
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