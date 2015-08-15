'use strict';

exports = module.exports = function (app, mongoose) {
    //
    require('./schema/ExpenseCategory')(app, mongoose);

    // regular docs
    require('./schema/User')(app, mongoose);
    require('./schema/LoginAttempt')(app, mongoose);
    require('./schema/Good')(app, mongoose);
    require('./schema/Expense')(app, mongoose);
    require('./schema/DeletedExpense')(app, mongoose);
    require('./schema/Report')(app, mongoose);
    require('./schema/DailyReport')(app, mongoose);

};