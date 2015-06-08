'use strict';

exports = module.exports = function (app, mongoose) {

    // regular docs
    require('./schema/user')(app, mongoose);

};