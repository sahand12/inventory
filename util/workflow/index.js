// util/workflow/index.js
'use strict';

exports = module.exports = function (req, res) {

    var EventEmitter = require('events').EventEmitter,
        workflow = new EventEmitter();

    workflow.outcome = {
        success: false,
        errors: [],
        errfor: {}
    };

    workflow.hasErrors = function () {
        return workflow.outcome.errors.length !== 0 || Object.keys(workflow.outcome).length !== 0;
    };

    workflow.on('exception', function (err) {
        workflow.outcome.errors.push('exception: ' + err);
        workflow.emit('response');
    });

    workflow.on('response', function () {
        workflow.success = !workflow.hasErrors();
        res.json(workflow.outcome);
    });
};