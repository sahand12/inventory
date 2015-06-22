// schema/Expense.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var ExpenseSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        category: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory'}
    });

    //
    ExpenseSchema.statics.findLatestByDays = function (days, done) {
        var startDate = Date.now() - days * 1000 * 60 * 60 * 24;
        var conditions = {
            date: { $gt: startDate }
        };
        this.find(conditions)
            .populate('user')
            .populate('category')
            .sort('date')
            .exec(function (err, expenses) {
                if (err) {
                    return done(err);
                }
                return done(null, expenses);
            });
    };


    ExpenseSchema.statics.findLatestByCount = function (count, done) {
        this.find()
            .populate('user')
            .populate('category')
            .sort('date')
            .limit(count)
            .exec(function (err, docs) {
                if (err) {
                    return done(err);
                }
                return done(null, docs);
            });
    };


    app.db.model('Expense', ExpenseSchema);
};

