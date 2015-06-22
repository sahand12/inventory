$(function () {

    var $expenseForm = $('#addExpenseForm'),
        $expenseModal = $('#addExpenseModal');

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
});