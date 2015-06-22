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
            bodyClass: 'cost-dashboard',
            pieData: [
                {
                    value: 300,
                    color:"#F7464A",
                    highlight: "#FF5A5E",
                    label: "Red"
                },
                {
                    value: 50,
                    color: "#46BFBD",
                    highlight: "#5AD3D1",
                    label: "Green"
                },
                {
                    value: 100,
                    color: "#FDB45C",
                    highlight: "#FFC870",
                    label: "Yellow"
                },
                {
                    value: 40,
                    color: "#949FB1",
                    highlight: "#A8B3C5",
                    label: "Grey"
                },
                {
                    value: 120,
                    color: "#4D5360",
                    highlight: "#616774",
                    label: "Dark Grey"
                }
            ],
            lineData : {
                labels: req.app.config.months,
                datasets: {   // dataset should be an array but it will be taken care of in the template
                    label: "This year activity",
                    fillColor: req.app.config.charts.line.fillColor,
                    strokeColor: req.app.config.charts.line.strokeColor,
                    pointColor: req.app.config.charts.line.pointColor,
                    pointStrokeColor: req.app.config.charts.line.pointColor,
                    pointHighlightFill: req.app.config.charts.line.pointHighlightFill,
                    pointHighlightStroke: req.app.config.charts.line.pointHighlightStroke,
                    data: [0, 10, 23, 43, 23, 15, 63, 63, 63, 23, 12, 12]
                }
            }
        };
        //console.log(data);
        return res.render('cost/dashboard', data);
    };


    /**
     * POST /cost/expenses
     */
    this.handleAddExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            var amount = parseInt(req.body.amount);
            req.checkBody('title', 'Each expense should have a title').notEmpty();
            req.checkBody('date', 'provide a valid date').isDate();
            req.checkBody('amount', 'provide an amount').notEmpty();
            req.checkBody('category', 'provide a category').notEmpty();

            var errors = req.validationErrors(true);
            if (isNaN(amount) || amount < 0) {
                errors = errors || {};
                errors.amount = { param: 'amount', msg: 'provide a positive number', value: req.body.amount };
            }

            if (errors) {
                var data = {
                    success: false,
                    validationErrors: errors
                };
                res.send(data);
            }

            workflow.emit('findCategory', req.body.category);
        });

        workflow.on('findCategory', function (cat) {
            req.app.db.models.ExpenseCategory.find({name: cat}, function (err, ctg) {
                if (err) {
                    return next(err);
                }
                if (!ctg) {
                    var data = {
                        success: false,
                        PostErrors: { category: {
                            param: 'category',
                            value: req.body.category,
                            msg: 'Invalid category'
                        }}
                    };
                    res.send(data);
                }
                var catId = ctg._id;
                workflow.emit('createExpense', catId);
            });
        });

        workflow.on('createExpense', function (catId) {
            var fieldsToSet = {
                user: req.user._id,
                title: req.body.title,
                date: req.body.date,
                description: req.body.description || "",
                category: catId
            };

            req.app.db.models.Expense.create(fieldsToSet, function (err, doc) {
                if (err) {
                    return next(err);
                }
                var data = {
                    success: true,
                    expense: doc
                };
                res.send(data);
            });
        });

        workflow.emit('validate');
    };
};

exports = module.exports = CostHandler;