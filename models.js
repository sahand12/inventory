'use strict';

exports = module.exports = function (app, mongoose) {
    //
    require('./schema/ExpenseCategory')(app, mongoose);

    // regular docs
    require('./schema/User')(app, mongoose);
    require('./schema/LoginAttempt')(app, mongoose);
    require('./schema/Good')(app, mongoose);
    require('./schema/Expense')(app, mongoose);

};