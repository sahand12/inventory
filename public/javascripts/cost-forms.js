$(function () {

    var $expenseForm = $('#addExpenseForm'),
        $expenseModal = $('#addExpenseModal'),
        $addExpenseCloseButton = $('#addExpenseCloseButton');

    $addExpenseCloseButton.on('click', function (e) {
        $expenseModal.modal('hide');
    });

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
            console.log(msg);
            $expenseModal.modal('hide');
        });
    }

    $('#addExpenseButton').on('click', onClickAddExpenseButton);

    function onClickAddExpenseButton (e) {
        // populate the category field in the add expense modal form
        var $selectCategory = $('#category');
        $selectCategory.empty();

        console.log('called');

        // get the list of category from the server
        $.ajax({
            method: 'get',
            url: '/cost/api/categories'
        }).done(function (response) {
            console.log(response.data);
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
            console.log(html);
            $select.html(html);
        }
    }
});