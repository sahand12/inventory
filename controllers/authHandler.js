/**
 * Created by MH on 6/5/2015.
 */
var helpers = require('./helpers');

function AuthHandler () {

    this.displayLoginPage = function (req, res, next) {
        if (req.user) {
            var redirectUrl = helpers.routeUserByRole(req.user.role);
            res.redirect(redirectUrl);
        }
        var vm = {
            title: 'Log in'
        };
        res.render('/sim/login');
    };

    this.handleLoginRequest = function (req, res, next) {

    };


}