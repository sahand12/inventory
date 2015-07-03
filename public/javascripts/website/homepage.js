$(function () {

    /**
     * ----------------------------------
     *     Globals
     * ----------------------------------
     */
    var $productItem = $('.product-item');

    /**
     * ----------------------------------
     *      PRODUCTS SECTION
     * ----------------------------------
     */
    $productItem.hover(function(e){
        $(this).find('a.btn').show();
    }, function (e){
        $(this).find('a.btn').hide();
    });


    /**
     * ----------------------------------
     *      DOMAINS SECTION
     * ----------------------------------
     */
});