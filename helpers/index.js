// helpers/index.js

exports.isAuthenticated = function (req, res, next) {

    // If user is authenticated in the session, call the next() to call
    // the next request handler.
    // Passport adds this method to request object. A middleware to add properties
    // to request and response objects
    if (req.isAuthenticated()) {
        return next();
    }

    // If not, redirect her to the login page
    res.set('X-Auth-Required', 'true');
    return res.redirect('/sim/login');
};


exports.routeUserByRole = function (user) {
    var redirectUrl = "/";
    switch (user.role) {
        case 'engineer':
            redirectUrl = '/engineer/';
            break;
        case "manager":
            redirectUrl = "/manager/";
            break;
        case 'supervisor':
            redirectUrl = "/supervisor/";
            break;
        default:
            redirectUrl = "/";
    }
    return redirectUrl;
};