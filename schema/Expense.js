// schema/Expense.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var ExpenseSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        description: { type: String, default: "" },
        amount: { type: Number },
        category: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpenseCategory' },
            name: String, default: ""
        },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    });

    // returns the last number of days of records
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

    ExpenseSchema.statics.findByUser = function (userId, count, done) {
        this.find({ user: userId })
            .sort({ updatedAt: "-1" })
            .limit(count)
            .exec(function (err, docs) {
            if (err) {
                return done(err);
            }
            return done(null, docs);
        });
    };

    // returns the total expense of a specific user
    ExpenseSchema.statics.findTotalExpenseByUser = function (userId, done) {
        this.find({ user: userId }, { amount: 1, _id: 0 }).exec(function (err, docs) {
            if (err) {
                return done(err);
            }
            var totalExpense = 0;
            for (var i = 0, len = docs.length; i < len; i++) {
                totalExpense += docs[i].amount;
            }
            console.log(docs);
            return done(null, totalExpense);
        });
    };

    /**
     *
     * @param userId mongoose.Schema.Types.ObjectId
     * @param days number - number of days from now to past that will look at
     * @param done callback - callback function that will receive an error object and and a group object in
     *                        format of: { category1Name: amount1, category2Name: amount2, ... }
     */
    ExpenseSchema.statics.findTotalExpenseByEachCategory = function (userId, days, done) {
        var startDate = Date.now() - days * 1000 * 60 * 60 * 24,
            endDate = Date.now();
        this.find({ user: userId, date: { $gt: startDate, $lt: endDate } }, { amount: 1, "category.name": 1, _id: 0 })
            .exec(function (err, docs) {
                if (err) {
                    return done(err);
                }

                // filter through the data to group by category and find the total expense in each category
                var group = {};
                for (var i = 0, len = docs.length; i < len; i++) {
                    var doc = docs[i],
                        docName = doc.category.name;
                    if ( docName in group ) {
                        group[docName] += doc.amount;
                    }
                    else {
                        group[docName] = doc.amount;
                    }
                }

                return done(null, group);
        });
    };

    ExpenseSchema.statics.findThisYearExpenses = function (userId, done) {
        var now = new Date(),
            currentYear = now.getFullYear(),
            startDate = new Date(currentYear, 0, 0),
            endDate = new Date(currentYear + 1, 0, 0);

        this.find({ date: { $gt: startDate, $lt: endDate }}, {date: 1, amount: 1, _id: 0}).exec(function (err, docs) {
            if (err) {
                return done(err);
            }
            return done(null, docs);
        });
    };


    app.db.model('Expense', ExpenseSchema);
};

