//    schema/DailyReport.js

'use strict';

exports = module.exports = function (app, mongoose) {

    var DailyReportSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        title: { type: String },
        date: { type: Date, default: Date.now },
        body: { type: String },
        seen: { type: Boolean, default: false }
    });

    DailyReportSchema.index({ user: 1 }, { background: true });
    DailyReportSchema.index({ date: 1 }, { background: true });
    DailyReportSchema.index({ seen: 1 }, { background: true });

    // Plugins
    var PagedFindPlugin = require('./plugins/pagedFind');
    DailyReportSchema.plugin(PagedFindPlugin);

    app.db.model('DailyReport', DailyReportSchema);
    return mongoose.model('DailyReport', DailyReportSchema);
};