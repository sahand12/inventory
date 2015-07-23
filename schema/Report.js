// schema/Report.js
'use strict';

exports = module.exports = function (app, mongoose) {

    var ReportSchema = new mongoose.Schema({
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        name: { type: String },
        createdAt: { type: Date, default: Date.now },
        startDate: { type: Date },
        endDate: { type: Date },
        type: { type: String },
        source: { type: String }
    });


    ReportSchema.statics.findAllReportsByUser = function (userId, done) {
        this.find({ user: userId }, function (err, docs) {
            return done(err, docs);
        });
    };

    app.db.model('Report', ReportSchema);
};