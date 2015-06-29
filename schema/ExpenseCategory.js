// schema/ExpenseCategory.js
'use strict';

exports = module.exports = function (app, mongoose) {

    var ExpenseCategory = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String, unique: true, lowercase: true },
        amount: { type: Number, default: 0 },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    ExpenseCategory.statics.findCategoriesByUser = function (userId, done) {
        this.find({ user: userId }, function (err, docs) {
            if (err) {
                return done(err);
            }
            return done(null, docs);
        });
    };

    ExpenseCategory.statics.findLatestAddedCategories = function (userId, number, done) {
        this.find({ user: userId }, { name: 1, amount: 1, _id: 0 })
            .limit(number)
            .sort({ "createdAt": -1 })
            .exec(function (err, docs) {
                if (err) {
                    return done(err);
                }
                return done(null, docs);
            });
    };

    app.db.model('ExpenseCategory', ExpenseCategory);
};
