'use strict';

exports.init = function (req, res, next) {
    req.logout();
    return res.render('logout/index');
};