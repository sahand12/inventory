// this service only returns json
'use strict';

exports = module.exports = function (app, mongoose) {

    this.listAll = function (data, done) {
        if (!done && typeof options === 'function') {
            done = options;
        }
        var options = {};
        options.limit = data.limit || 10;
        options.sortBy = data.sortBy || 'timeUpdated';
        options.skip = data.skip || 0;

        app.db.models.Good.find()
            .sort(options.sortBy, 1)
            .skip(options.skip)
            .limit(options.limit)
            .exec(function (err, goods){
                if (err) {
                    return next(err);
                }
                return done(null, goods);
            });
    };
};