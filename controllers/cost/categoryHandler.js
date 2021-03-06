// controllers/cost/categoryHandler
'use strict';

var CategoryHandler = function CategoryHandler (app){

    /**
     * GET cost/categories
     */
    this.showCategories = function (req, res, next) {
        req.app.db.models.ExpenseCategory.find({}, function (err, docs) {
            if (err) {
                return next(err);
            }
            var data = {
                categories: docs
            };
            return res.render('cost/categories.handlebars', data);
        });
    };

    /**
     * POST cost/categories
     */
    this.handleAddCategoryRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            var categoryPattern = /^[\w\d ]+/g,
                errors;

            if (!categoryPattern.test(req.body.categoryName)) {
                errors = {
                    categoryName: {
                        param: 'Category name',
                        value: req.body.categoryName,
                        msg: "Only English alphabet characters and numbers are allowed"
                    }
                };
            }

            if (errors) {
                var data = {
                    success: false,
                    validationErrors: errors
                };
                return res.send(data);
            }

            workflow.emit('createCategory');
        });


        workflow.on('createCategory', function() {
           req.app.db.models.ExpenseCategory.create({ name: req.body.categoryName }, function (err, doc) {
               if (err) {
                   if (err.code === 11000) {
                       var postErrors = {
                           error: 'This category already exists in the system'
                       };
                       return res.send({
                           success: false,
                           postErrors: postErrors
                       });
                   }

                   return next (err);
               }
               var data = {
                   success: true,
                   category: doc
               };
               return res.send(data);
           });
        });

        workflow.emit('validate');
    };
};

exports = module.exports = CategoryHandler;