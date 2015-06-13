'use strict';

exports = module.exports = function (app, mongoose) {

    // regular docs
    require('./schema/User')(app, mongoose);
    require('./schema/LoginAttempt')(app, mongoose);
    require('./schema/Good')(app, mongoose);

};