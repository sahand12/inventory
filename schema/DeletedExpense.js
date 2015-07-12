// schema/Expense.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var DeletedExpenseSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        amount: { type: Number },
        category: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
            name: String, default: ""
        },
        deletedAt: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });


    DeletedExpenseSchema.statics.findByCategory = function (categoryName, userId, done) {
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

    DeletedExpenseSchema.statics.findByUser = function (userId, count, done) {
        this.find({ user: userId }, { title: 1, date: 1, amount: 1, "category.name": 1, description: 1 })
            .sort({ date: "-1" })
            .limit(count)
            .exec(function (err, docs) {
            if (err) {
                return done(err);
            }
            return done(null, docs);
        });
    };

    app.db.model('DeletedExpense', DeletedExpenseSchema);
};

