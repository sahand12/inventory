$(function () {

    var $expenseForm = $('#addExpenseForm'),
        $AddExpenseModal = $('#addExpenseModal'),
        $addExpenseCloseButton = $('#addExpenseCloseButton');

    /**
     * -----------------------------------------
     *     MODAL SHOWING HANDLING
     * -----------------------------------------
     */
    $AddExpenseModal.on('shown.bs.modal', function (e){
        // delete any pre populated form errors
        app.helpers.emptyFormErrors($('.form-group'), $('.cost-form-error-item'), $('.cost-form-error-head'));
    });


    /**
     * -----------------------------------------
     *     ADD EXPENSE CLOSE BUTTON HANDLING
     * -----------------------------------------
     */
    $addExpenseCloseButton.on('click', function (e) {
        $AddExpenseModal.modal('hide');
    });

    /**
     * -----------------------------------------
     *     ADD EXPENSE FORM SUBMIT
     * -----------------------------------------
     */
    $expenseForm.on('submit', function (e) {
        e.preventDefault();
        var self = this;

        // first format the data
        var data = formatFormData(self);
        addExpenseAjax(self, data);
    });

    function formatFormData (self) {
        return {
            title: self.title.value,
            amount: self.amount.value,
            date: self.date.value,
            category: self.category.value,
            description: self.description.value
        };
    }

    function addExpenseAjax (self, data) {
        $.ajax({
            method: "post",
            url: $(self).attr('action'),
            data: data
        }).done(function (msg) {
            if (msg.success) {
                app.emitEvent('expense.form.submit.success');
                $AddExpenseModal.modal('hide');
            }
            else {
                // First clear any errors if any from the form
                app.helpers.emptyFormErrors($('.form-group'), $('.cost-form-error-item'), $('.cost-form-error-head'));

                // show new errors now
                showAddExpenseFormErrors(msg);
            }
        });
    }

    function showAddExpenseFormErrors (response) {
        var validationErrors = response.validationErrors,
            postErrors = response.postErrors;

        if (validationErrors) {
            for (var err in validationErrors) {
                if (validationErrors.hasOwnProperty(err)) {
                    var inputId = "#" + err.toLowerCase(),
                        $formGroupWithError = $(inputId).closest('.form-group'),
                        $errorDesc = $formGroupWithError.find('.cost-form-error-item');

                    $formGroupWithError.addClass('has-error');
                    $errorDesc.html( "&bull; " + validationErrors[err].msg);
                }
            }
        }

        if (postErrors) {
            $('cost-form-error-head').html('<p class="alert alert-danger">An error happened during form submission. Please try again.</p>');
        }
    }


    /**
     * -----------------------------------------------
     *      ADD EXPENSE CLICK HANDLING
     * -----------------------------------------------
     */
    $('#addExpenseButton').on('click', onClickAddExpenseButton);

    function onClickAddExpenseButton (e) {
        // populate the category field in the add expense modal form
        var $selectCategory = $('#category');
        $selectCategory.empty();

        // get the list of category from the server
        $.ajax({
            method: 'get',
            url: '/cost/api/categories'
        }).done(function (response) {
            populateSelectCategory(response, $selectCategory);
        }).error(function (err) {
            console.log(err);
        });
    }

    function populateSelectCategory (response, $select) {
        if (response.success) {
            var html = "";
            for (var i = 0, len = response.data.length; i < len; i++) {
                //console.log(response.data[i]);
                html += "<option class='text-capitalize' value='" + response.data[i].name.toLowerCase() + "'>" + response.data[i].name + "</option>";
            }
            //console.log(html);
            $select.html(html);
        }
    }
});