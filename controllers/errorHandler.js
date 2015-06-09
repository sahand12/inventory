/**
 * Created by hamid on 6/8/15.
 */
'use strict';

exports = module.exports = function () {

    this.http500 = function (err, req, res, next) {
        res.status(500);

        var data = {err: {}};
        if (req.app.get('env') === 'development') {
            data.err = err;
            console.log(err.stack);
        }

        if (req.xhr) {
            res.json({error: "Something went wrong", details: data});
        }
        else {
            res.render('http/500', data);
        }
    };

    this.http404 = function (req, res, next) {
        res.status(404);
        if (req.xhr) {
            res.json({ error: 'Resource not found.' });
        }
        else {
            res.render('http/400');
        }
    };
};