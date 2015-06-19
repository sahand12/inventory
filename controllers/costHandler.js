/**
 * Created by sahand on 6/19/15.
 */
"use strict";

var CostHandler = function CostHandler (app) {

    /*
     * GET /cost/dashboard
     */
    this.showDashboard = function (req, res, next) {
        var data = {
            layout: 'cost.dashboard.handlebars',
            user: req.user,
            title: "Cost Management Dashboard",
            bodyClass: 'cost-dashboard'
        };
        console.log(data);
        return res.render('cost/dashboard', data);
    };

};

exports = module.exports = CostHandler;