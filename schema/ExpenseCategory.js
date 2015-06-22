// schema/ExpenseCategory.js
'use strict';

exports = module.exports = function (app, mongoose) {

    var ExpenseCategory = new mongoose.Schema({
        name: { type: String, unique: true }
    });

    app.db.model('ExpenseCategory', ExpenseCategory);
};
