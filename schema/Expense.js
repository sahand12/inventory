// schema/Expense.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var ExpenseSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        category: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
            name: String, default: ""
        }
    });

    //
    ExpenseSchema.statics.findLatestByDays = function (days, done) {
        var startDate = Date.now() - days * 1000 * 60 * 60 * 24;
        var conditions = {
            date: { $gt: startDate }
        };
        this.find(conditions)
            .populate('user', 'name')
            .populate('category', 'name')
            .sort({ date: -1 })
            .limit(10)
            .exec(function (err, expenses) {
                if (err) {
                    return done(err);
                }
                return done(null, expenses);
            });
    };


    ExpenseSchema.statics.findLatestByCount = function (count, done) {
        this.find()
            .populate('user', 'name')
            .populate('category.id', 'name')
            .sort({ "date": -1 })
            .limit(count)
            .exec(function (err, docs) {
                if (err) {
                    return done(err);
                }
                return done(null, docs);
            });
    };

    ExpenseSchema.statics.findByCategory = function (categoryName, userId, done) {
        var count = 10;
        this.find({ 'category.name': categoryName, 'user': userId })
            .populate('user', 'name')
            .sort({ date: -1 })
            .limit(count)
            .exec(function (err, docs) {
                if (err) {
                    return done(err);
                }
                return done(null, docs);
            });
    };

    ExpenseSchema.statics.findByUser = function (userId, done) {
        this.find({ user: userId }).populate('user', 'name').exec(function (err, docs) {
            if (err) {
                return done(err);
            }
            return done(null, docs);
        });
    };


    app.db.model('Expense', ExpenseSchema);
};

