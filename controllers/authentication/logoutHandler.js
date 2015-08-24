'use strict';

exports.init = function (req, res, next) {
    var vm = {
        title: "Logged Out",
        layout: "auth.handlebars"
    };
    req.logout();
    //return res.render('authentication/logout/index', vm);
    return res.redirect('/login');
};