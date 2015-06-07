/**
 * Created by hamid on 6/2/15.
 */

'use strict';

var EventEmitter = require('events').EventEmitter;

module.exports = function (req, res) {

    var workflow = new EventEmitter();
    workflow.outcome = {
        success: false,
        errors: [],
        errfor: {}
    };

    workflow.hasErrors = function () {
        return errors.length !== 0 || Object.keys(workflow.outcome.errfor).length !== 0;
    };

    workflow.on('exception', function (err) {
        workflow.outcome.errors.push('exception: ', err);
        workflow.emit('response');
    });

    workflow.on('response', function () {
        workflow.outcome.success = !workflow.hasErrors();
        res.send(workflow.outcom);
    });

    return workflow;
};