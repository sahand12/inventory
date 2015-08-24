$(function () {

    /*
     * ----------------------------
     *      EVENT LISTENERS
     * ----------------------------
     */
    app.addListener('page.load', buildAdminCategoriesTable);
    app.addListener('search.button.click', buildAdminCategoriesTable);
    app.addListener('expense.form.submit.success', buildAdminCategoriesTable);


    /*
     * --------------------------
     *     GLOBAL VARIABLES
     * --------------------------
     */
    var $adminCategoriesTableBody = $('.')
    var $startInput = $();
    var $endInput = $();
    var $datePickerBtn = $();
    var $barChartContainer = $();
    var $tableAjaxSpinner = $();

    var categoryColors = {};

    /*
     * ----------------------------
     *     EMIT PAGE LOAD EVENT
     * ---------------------------
     */
    app.emit('page.load');


    /*
     * ---------------------------
     *      CATEGORIES TABLE AND BAR CHART
     * ---------------------------
     */
    function buildAdminCategoriesTable () {

    }
});