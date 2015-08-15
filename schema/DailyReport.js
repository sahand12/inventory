//    schema/DailyReport.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var DailyReportSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        category: {
            id: { type: mongoose.Schema.Types.ObjectId, ref: 'ExpanseCategory' },
            name: { type: String }
        },
        body: { type: String },
        seen: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
    });

    DailyReportSchema.index({ user: 1 }, { background: true });
    DailyReportSchema.index({ date: 1 }, { background: true });


    app.db.model('DailyReport', DailyReportSchema);
    return mongoose.model('DailyReport', DailyReportSchema);
};