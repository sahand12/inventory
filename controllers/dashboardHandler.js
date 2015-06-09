/**
 * Created by MH on 6/10/2015.
 */
'use strict';

exports.init = function (req, res, next) {
    res.json(req.user);
};