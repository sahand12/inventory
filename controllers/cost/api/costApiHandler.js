'use strict';

var CostApiHandler = function (app) {

    /*
     * GET /cost/api/expenses/category/:categoryName
     */
    this.listExpensesByCategory = function (req, res, next) {
        console.log(req.params);

        req.app.db.models.Expense.findByCategory(req.params.categoryName, req.user._id, function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    error: "database Error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cos/api/expenses?count=number
     */
    this.listExpensesByUser = function (req, res, next) {
        var count = req.query.count || 5;
        req.app.db.models.Expense.findByUser(req.user._id, count, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cost/api/expenses/total
     */
    this.showTotalExpenses = function (req, res, next) {
        req.app.db.models.Expense.findTotalExpensesByCategory(req.user._id, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /*
     * GET /cost/api/expenses/categories?days=number
     *
     * ajax url for last 30 days pie chart on dashboard
     */
    this.showTotalExpensesByEachCategory = function (req, res, next) {
        var options = {
            userId: req.user._id,
            future: req.query.future || false,
            startDate: parseInt(req.query.startDate) || false,
            endDate: parseInt(req.query.endDate) || false,
            days: parseInt(req.query.days) || false
        };
        req.app.db.models.Expense.findTotalExpenseByEachCategory(options, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };


    /*
     * GET /cost/api/?satrt=...&end=...
     */
    this.showTotalExpensesByEachCategory = function (req, res, next) {
        var options = {
            userId: req.user._id,
            future: req.query.future || false,
            endDate: req.query.endDate || false,
            startDate: req.query.startDate || false
        };

        req.app.db.models.Expense.findTotalExpenseByEachCategory(options, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /**
     * Get /cost/api/expenses/this-year
     */
    this.showThisYearExpenses = function (req, res, next) {
        req.app.db.models.Expense.findThisYearExpenses(req.user._id, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    error: "database error"
                });
            }

            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /**
     * GET /cost/api/expenses/count
     */
    this.findTotalNumberOfExpenses = function (req, res, next) {
        req.app.db.models.Expense.count({ user: req.user._id }, function (err, count) {
            if (err) {
                return res.send({
                    success: false,
                    error: "database error"
                });
            }
            return res.send({
                success: true,
                count: count
            });
        });
    };

    /**
     * PUT /cost/api/expenses
     */
    this.handleUpdateExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        // TODO: validate that title has only words, spaces and numbers
        // TODO: validate description as well
        workflow.on('validate', function () {
            var amount = parseInt(req.body.amount);
            req.checkBody('title', 'each expense should have a title').notEmpty();
            req.checkBody('amount', 'provide an amount').notEmpty();
            req.checkBody('category', 'select a category').notEmpty();
            req.checkBody('date', 'provide a valid date (mm/dd/yyyy)').isDate();

            var errors = req.validationErrors(true);
            if (isNaN(amount) || amount < 0) {
                errors = errors || {};
                errors.amount = { param: "amount", msg: "provide a positive number", value: req.body.amount };
            }

            if (errors) {
                var data = {
                    success: false,
                    validationErrors: errors
                };
                return res.send(data);
            }
            workflow.emit('findCategory', req.body.category.toLowerCase());
        });

        workflow.on('findCategory', function (categoryName) {
            req.app.db.models.ExpenseCategory.findOne({name: categoryName}, function (err, category) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: 'Database Error'
                    });
                }
                if (!category) {
                    return res.send({
                        success: false,
                        postErrors: { error: 'Invalid category' }
                    });
                }
                workflow.emit('updateExpense', category._id, category.name);
            });
        });

        workflow.on('updateExpense', function (categoryId, categoryName) {
            var updateQuery = {
                $set: {
                    title: req.body.title,
                    amount: req.body.amount,
                    date: req.body.date,
                    description: req.body.description,
                    'category.name': categoryName,
                    'category.id': categoryId
                }
            };
            req.app.db.models.Expense.findByIdAndUpdate(req.body._id, updateQuery, function (err, newDoc) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                return res.send({
                    success: true,
                    data: newDoc
                });
            });
        });

        workflow.emit('validate');
    };

    /**
     * DELETE  /cost/api/expense
     */
    this.handleDeleteExpenseRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('_id', 'invalid expense item').notEmpty();

            var errors = req.validationErrors();

            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: { _id: { param: "id", msg: "no item is selected", value: req.body._id } }
                });
            }

            workflow.emit('findExpense', req.body._id);
        });

        workflow.on('findExpense', function (id) {
            req.app.db.models.Expense.findById(id).exec(function (err, doc) {
                if (err) {
                    return res.send({
                        success: false,
                        postErrors: { error: "database error" }
                    });
                }
                if (!doc) {
                    return res.send({
                        success: false,
                        postErrors: { error: "Invalid request"}
                    });
                }

                workflow.emit('createDeletedExpense', doc);
            });
        });

        workflow.on('createDeletedExpense', function (doc) {
            var fieldsToSet = {
                amount: doc.amount,
                title: doc.title,
                user: doc.user,
                category: doc.category,
                description: doc.description,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt
            };
            req.app.db.models.DeletedExpense.create(fieldsToSet, function (err, newDoc) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                console.log(newDoc);
                workflow.emit('deleteExpense', doc._id);
            });
        });

        workflow.on('deleteExpense', function (_id) {
            req.app.db.models.Expense.find({_id: _id }).remove(function (err) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                return res.send({
                    success: true
                });
            });
        });

        workflow.emit('validate');
    };

    /**
     * GET cost/api/categories
     */
    this.findAllCategories = function (req, res, next) {
        req.app.db.models.ExpenseCategory.find({}, {amount: 1, name: 1, _id: 1}, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    postErrors: { error: 'database error'}
                })
            }
            console.log(docs);
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    /**
     * POST /cost/api/categories
     */
    this.handleCreateCategoryRequest = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        workflow.on('validate', function () {
            req.checkBody('categoryName', "Name field is required").notEmpty();
            req.checkBody('categoryAmount', 'amount should be a positive number').isInt();

            var errors = req.validationErrors(true);
            if (errors) {
                return res.send({
                    success: false,
                    validationErrors: errors
                });
            }
            workflow.emit('checkDuplicateCategoryName', req.body.categoryName.toLowerCase().trim());
        });

        workflow.on('checkDuplicateCategoryName', function (name) {
            req.app.db.models.ExpenseCategory.findOne({ name: name }, function (err, doc) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error'}
                    });
                }
                if (doc) {
                    console.log(doc);
                    return res.send({
                        success: false,
                        postErrors: { error: "category: '" + name + "' already exists." }
                    });
                }
                workflow.emit('createNewCategory', name);
            });
        });

        workflow.on('createNewCategory', function (name) {
            var fieldsToSet = {
                name: name,
                user: req.user._id,
                amount: parseInt(req.body.categoryAmount)
            };
            req.app.db.models.ExpenseCategory.create(fieldsToSet, function (err, doc) {
                if (err) {
                    return res.send({
                        success: false,
                        postErrors: { error: "database error" }
                    });
                }
                console.log('create', doc);
                return res.send({
                    success: true,
                    data: doc
                });
            });
        });

        workflow.emit('validate');
    };


    /**
     * GET /cost/api/categories/latest?count=number
     */
    this.findLatestAddedCategories = function (req, res, next) {
        var count = req.query.count || 5;
        req.app.db.models.ExpenseCategory.findLatestAddedCategories(req.user._id, count, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    postErrors: { error: "database error" }
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };


    this.getPaginatedExpensesByUser = function (req, res, next) {
        var options = {
            filters: {
                user: req.user._id
            },
            keys: {
                amount: 1,
                'category.name': 1,
                date: 1,
                description: 1,
                title: 1
            },
            page: (parseInt(req.query.page) || 1),
            sort: {
                "date": -1
            },
            limit: req.query.limit || 10
        };

        req.app.db.models.Expense.pagedFind(options, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    postErrors: 'database error'
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };


    // GET       /cost/api/expenses/search?q=...
    this.getSearchExpensesResult = function (req, res, next) {
        req.query.q = (typeof req.query.q !== 'undefined') ? req.query.q : "";
        var regexQuery = new RegExp('^.*?' + req.query.q + ".*$", 'i');
        var query = { user: req.user._id, $or: [{ title: regexQuery }, { description: regexQuery }]};

        req.app.db.models.Expense.find(query).populate('user', 'name').exec(function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    postErrors: { error: 'database error' }
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };

    this.getAllExpenses = function (req, res, next) {
        var query = {};
        var filters = {};
        req.app.db.models.Expense.find(query, filters)
            .populate('user', 'name')
            .sort({ data: -1 })
            .exec(function (err, docs) {
                return res.json({
                    success: true,
                    data: docs
                });
            }
        );
    };

    /*this.getAllExpenses = function (req, res, next) {
        var options = {
            keys: {
                amount: 1,
                'category.name': 1,
                date: 1,
                description: 1,
                title: 1
            },
            page: (parseInt(req.query.page) || 1),
            sort: {
                "date": -1
            },
            limit: req.query.limit || 10
        };

        req.app.db.models.Expense.pagedFind(options, function (err, docs) {
            if (err) {
                console.log(err);
                return res.send({
                    success: false,
                    postErrors: 'database error'
                });
            }
            return res.send({
                success: true,
                data: docs
            });
        });
    };*/

    this.getTotalExpensesByEachCategory = function (req, res, next) {
        var query = { user: req.user._id };
        var filter = { amount: 1, 'category.name': 1, _id: 0 };
        req.app.db.models.Expense.find(query, filter).exec(function (err, docs) {
            if (err) {
                return res.send({
                    success: false,
                    postErrors: { error: 'database error' }
                });
            }
            var results = {};
            for (var i = 0, len = docs.length; i < len; i++) {
                var current = docs[i];
                if (typeof results[current.category.name] === 'undefined') {
                    results[current.category.name] = current.amount;
                }
                else {
                    results[current.category.name] += current.amount;
                }
            }

            return res.send({
                success: true,
                data: results
            });
        });
    };


    this.getAllReportsByUser = function (req, res, next) {
        var query = { user: req.user._id };
        req.app.db.models.Report.find(query).sort({ createdAt: -1 }).exec(function (err, results) {
            if (err) {
                console.log(err);
                return res.json({
                    success: false,
                    postError: { error: 'database error' }
                });
            }
            return res.json({
                success: true,
                data: results
            });
        });
    };

    // Create a new report
    this.createNewReport = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);
        console.log(req.body);

        workflow.on('validate', function () {
            req.checkBody('startDate', 'provide a valid start date').isInt();
            req.checkBody('endDate', 'provide a valid end date').isInt();
            req.checkBody('title', 'title field can not be empty').notEmpty();
            req.checkBody('type', 'select a type please').isIn(['csv', 'pdf']);

            var errors = req.validationErrors(true);
            if (errors) {
                console.log(errors);
                return res.send({
                    success: false,
                    validationErrors: errors
                });
            }

            workflow.emit('findExpenses');
        });

        workflow.on('findExpenses', function () {
            var startDate = req.body.startDate;
            var endDate = req.body.endDate;
            var query = { user: req.user._id, date: { $gte: startDate, $lte: endDate } };
            var filter = { title: 1, date: 1, description: 1, amount: 1, 'category.name': 1};
            req.app.db.models.Expense.find(query, filter).sort({ date: -1 }).exec(function (err, docs) {
                if (err) {
                    console.log(err);
                    return res.json({
                        success: false,
                        data: docs
                    });
                }

                if (req.body.type === 'csv') {
                    workflow.emit('createCSVReport', docs);
                }
                else if (req.body.type === 'pdf') {
                    workflow.emit('createPDFReport', docs);
                }
            });
        });

        workflow.on('createCSVReport', function (docs) {
            var fs = require('fs');
            var path = require('path');
            var reportFileName = "report-" + Date.now() + '.csv';
            var filePath = path.normalize(__dirname + "../../../../files/reports/" + reportFileName);
            console.log(filePath);
            var reportStream = fs.createWriteStream(filePath);

            reportStream.on('finish', function () {
               workflow.emit('createReportRecord', reportFileName);
            });

            reportStream.write('"TITLE","DATE","DESCRIPTION","CATEGORY","AMOUNT"\n');

            for (var i = 0, len = docs.length; i < len; i++) {
                var current = docs[i];
                reportStream.write('"' + current.title + '",');
                reportStream.write('"' + current.date + '",');
                reportStream.write('"' + current.description + '",');
                reportStream.write('"' + current.category.name + '",');
                reportStream.write('"' + current.amount + '"');
                reportStream.write('\n');
            }

            reportStream.end();
        });

        workflow.on('createPDFReport', function (docs) {
            //console.log('docs');
            var PDFDocument = require('pdfkit');
            var fs = require('fs');
            var path = require('path');

            var fileName = 'report-' + Date.now() + '.pdf';
            var filePath = path.normalize(__dirname + "../../../../files/reports/" + fileName);
            var pdfStream = fs.createWriteStream(filePath);

            pdfStream.on('finish', function () {
                workflow.emit('createReportRecord', fileName);
            });

            var doc = new PDFDocument({ size: 'A4' });
            var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', "August", 'September', 'October', 'November', 'December'];
            var timePeriod = formatDate(parseInt(req.body.startDate)) + " - " + formatDate( parseInt(req.body.endDate) );
            var today = formatDate( new Date() );
            var credit = 'GENERATED BY WWW.VGNENERGY.COM';
            var name = req.user.name.first + " " + req.user.name.last;

            doc.pipe( pdfStream );

            var fontPath = path.normalize(__dirname + "../../../../public/fonts/Lateef.ttf");
            doc.registerFont('yekan', fontPath);
            //fontPath = path.normalize(__dirname + "../../../../public/fonts/scheherazade/ScheherazadeRegOT.ttf");
            //doc.registerFont('arabic', fontPath);

            var logoPath = path.normalize(__dirname + '../../../../public/images/logo.png');

            createHeader();

            /*
             * ------------------------------
             * 		DYNAMIC CONTENTS
             * ------------------------------
             */

            doc.moveTo(20, 225).lineTo(572, 225).stroke('#aaa');
            //doc.font('josefin');
            doc.fillColor('#3eb39e').fontSize(13).text('DATE', 30, 240, { width: 80, align: 'left' });
            doc.fillColor('#3eb39e').fontSize(13).text('TITLE', 110, 240, { width: 186, align: 'left' });
            doc.fillColor('#3eb39e').fontSize(13).text('CATEGORY', 326, 240, { width: 114, align: 'left' });
            doc.fillColor('#3eb39e').fontSize(13).text('AMOUNT (IRR)', 444, 240, { width: 120, align: 'right' });
            doc.moveTo(20, doc.y + 9).lineTo(572, doc.y + 9).stroke('#aaa');
            var data = docs;
            var categories = {};
            var total = 0;

            doc.y = doc.y + 10;

            for (var i = 0, len = data.length; i < len; i++) {
                var exp = data[i];
                total += exp.amount;
                if ( typeof categories[exp.category.name] === 'undefined' ) {
                    categories[exp.category.name] = exp.amount;
                } else {
                    categories[exp.category.name] += exp.amount;
                }

                var y = doc.y + 13;
                if (i % 2 === 0 ) doc.rect(20, doc.y, 552, doc.currentLineHeight() + 26).fill('#f6f6f6');
                doc.fillColor('#464646').fontSize(11).text(formatDateForTable(exp.date), 30, y, { width: 80, align: 'left' });
                var isPersian = checkIfPersian(exp.title);
                if (isPersian) {
                    doc.font('yekan');
                }
                doc.fillColor('#464646').fontSize(11).text(exp.title.slice(0, 35), 110, y, { width: 186, align: 'left' });
                doc.font('Helvetica');
                doc.fillColor('#464646').fontSize(11).text(exp.category.name, 326, y, { width: 114, align: 'left' });
                doc.fillColor('red').fontSize(11).text(formatAmount(exp.amount), 444, y, { width: 120, align: 'right' }).moveDown();
                if (i === 12) {
                    doc.moveTo(20, doc.y).lineTo(20, 225).stroke('#aaa');
                    doc.moveTo(20, doc.y).lineTo(572, doc.y).stroke('#aaa');
                    doc.moveTo(572, doc.y).lineTo(572, 225).stroke('#aaa');
                    doc.addPage();
                    y = doc.y;
                    doc.fillColor('#3eb39e').fontSize(13).text('DATE', 30, y, { width: 80, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('TITLE', 110, y, { width: 186, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('CATEGORY', 326, y, { width: 114, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('AMOUNT (IRR)', 444, y, { width: 120, align: 'right' });
                    doc.y += 5;
                }
                else if ( i > 18 && (i + 1 < len) && ((i - 12) % 17 === 0) ) {
                    doc.rect(20, 60, 552, doc.y - 10 - doc.currentLineHeight() * 5).stroke('#aaa');
                    doc.moveTo(20, 92).lineTo(572, 92).stroke('#aaa');

                    doc.addPage();
                    y = doc.y;
                    doc.fillColor('#3eb39e').fontSize(13).text('DATE', 30, y, { width: 80, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('TITLE', 110, y, { width: 186, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('CATEGORY', 326, y, { width: 114, align: 'left' });
                    doc.fillColor('#3eb39e').fontSize(13).text('AMOUNT (IRR)', 444, y, { width: 120, align: 'right' });
                    doc.y += 5;
                }

            }
            if ( i <= 12) {
                doc.rect(20, 225, 552, doc.y - 225).stroke('#aaa');
            }
            if ( i > 12) {
                doc.rect(20, 60, 552, doc.y - 10 - doc.currentLineHeight() * 5).stroke('#aaa');
                doc.moveTo(20, 92).lineTo(572, 92).stroke('#aaa');
            }

            // Draw total amount table
            doc.addPage();
            createHeader();
            doc.y += 80;
            var startY = doc.y;
            doc.moveTo(20, doc.y).lineTo(572, doc.y).stroke('#aaa');
            doc.moveDown();
            var j = 0;
            for (var cat in categories) {
                if (categories.hasOwnProperty(cat)) {
                    if (++j % 2 === 0) {
                        doc.rect(20, doc.y - 9, 552, 29).fill('#f6f6f6');
                    }
                    var sameLineY = doc.y;
                    doc.fontSize(12).fillColor('#464646').text(cat.toUpperCase(), 30, sameLineY, { width: 400 });
                    doc.fillColor('red').text(formatAmount(categories[cat]), 430, sameLineY, { width: 130, align: 'right'}).moveDown();
                }
            }
            var bottomCatLineY = doc.y - startY - doc.currentLineHeight() + 4;
            doc.rect(20, startY, 552, bottomCatLineY).stroke('#aaa');
            doc.y += 5;
            sameLineY = doc.y;
            doc.fontSize(12).fillColor('#464646').text('TOTAL', 30, sameLineY, { width: 400 });
            doc.fillColor('red').text(formatAmount(total), 430, sameLineY, { width: 130, align: 'right'});
            doc.rect(20, startY + bottomCatLineY, 552, doc.y - startY - bottomCatLineY + 9).stroke('#aaa');

            doc.end();

            function formatDate (d) {
                var date = new Date(d);
                var month = months[date.getMonth()];
                var year = date.getFullYear();
                var day = date.getDate();
                return month + ' ' + day + ', ' + year;
            }

            function checkIfPersian (string) {
                for (var i = 0, len = string.length; i < len; i++) {
                    if (string.charCodeAt(i) > 128) {
                        return true;
                    }
                }
            }


            function formatDateForTable (d) {
                var date = new Date(d);
                var month = date.getMonth() + 1;
                var year = date.getFullYear();
                var day = date.getDate();
                return day + '/' + month + '/' + year;
            }

            function formatAmount(number) {
                number = "" + number;
                return number.replace(/(\d)(?=(?:\d{3})+$)/g, '$1' + ',');
            }

            function createHeader () {
                doc.image(logoPath, 40, 80, { width: 70 });
                doc.fontSize(16);
                doc.text('Expense Report', 120, 100);
                doc.fontSize(12)
                    .fillColor('gray')
                    .text(timePeriod, 120, 125);

                doc.rect(350, 40, 180, 75).fillAndStroke('#9bd5cb', '#aaa')
                    .rect(350, 115, 180, 60).stroke()
                    .rect(350, 175, 180, 20).stroke();

                doc.fontSize(16).fillColor('white').text(today, 350, 70, { width: 180, align: 'center' });
                doc.fontSize(8).fillColor('#9bd5cb').text(credit, 350, 182, { width: 180, align: 'center' });
                doc.fontSize(13).fillColor('#464646').text(name, 405, 140, { width: 125, align: 'center' });

                var avatarPath = path.normalize(__dirname + '../../../../public/images/avatar.png');
                doc.image(avatarPath, 354, 120, { height: 50 });
                doc.moveTo(405, 115).lineTo(405, 175).stroke('#aaa');
            }
        });

        workflow.on('createReportRecord', function (fileName) {
            var fieldsToSet = {
                user: req.user._id,
                name: req.body.title,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                type: req.body.type,
                fileName: fileName
            };

            req.app.db.models.Report.create(fieldsToSet, function (err, newDoc) {
                if (err) {
                    return res.json({
                        success: false,
                        postErrors: { error: "database error" }
                    });
                }
                return res.json({
                    success: true,
                    data: newDoc
                });
            });
        });

        workflow.emit('validate');
    };


    this.sendReport = function (req, res, next) {
        var fileName = req.query.fn;
        var fileType = req.query.ft;
        var fs = require('fs');
        var path = '/files/reports/' + fileName + '.' + fileType;
        var contentType = (fileType === 'csv') ? 'text/csv' : 'application/pdf';

        fs.exists(path, function (exists) {
            if (exists) {
                res.setHeader('content-disposition', 'attachment; filename=' + fileName);
                res.setHeader('Content-Type', contentType);
                return res.send(path);
            }
            else {
                return res.send({
                    success: false,
                    postErrors: { error: 'file does not exist' }
                });
            }
        });
    };


    // DELETE     /cost/api/reports/:id
    this.deleteReport = function (req, res, next) {
        var workflow = req.app.utility.workflow(req, res);

        // check if the provided _id is an actual ObjectId
        var _id = req.params.id;
        var mongodb = require('mongodb');
        var objectId = mongodb.ObjectID;
        workflow.on('validate', function () {
            var isIdValid = objectId.isValid(_id);
            if (isIdValid) {
                workflow.emit('findReport');
            }
            else {
                return res.send({
                    success: 'false',
                    id: _id,
                    postErrors: { error: 'invalid object id' }
                });
            }
        });

        // Find the expense with that id from db
        workflow.on('findReport', function () {
            req.app.db.models.Report.findById(_id, function (err, doc) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: false,
                        postErrors: { error: 'database error' }
                    });
                }
                if (!doc) {
                    return res.send({
                        success: false,
                        postErrors: { error: 'invalid request' }
                    });
                }
                // remove the doc from the database
                workflow.emit('deleteReportFile', doc.fileName);
                doc.remove();
            });
        });

        // delete the file from disk
        workflow.on('deleteReportFile', function (fileName) {
            var fs = require('fs');
            var path = require('path');
            var filePath = path.normalize(__dirname + "../../../../files/reports/" + fileName);

            fs.unlink(filePath, function (err) {
                if (err) {
                    console.log(err);
                    return res.send({
                        success: true
                    });
                }
                return res.send({
                    success: true
                });
            });
        });

        workflow.emit('validate');
    }
};

exports = module.exports = CostApiHandler;