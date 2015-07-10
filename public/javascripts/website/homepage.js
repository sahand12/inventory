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
        //$(this).parent().siblings().find('.product-item').css({ opacity: 0.8 });
    }, function (e){
        $(this).find('a.btn').hide();
    });


    /**
     * ----------------------------------
     *      DOMAINS SECTION
     * ----------------------------------
     */
    $('.slick-container').slick({
        infinite: true,
        //autoplay: true,
        autoplaySpeed: 4000,
        slidesToShow: 3,
        slidesToScroll: 1,
        prevArrow: $('.slick-prev-btn'),
        nextArrow: $('.slick-next-btn')
    });

    $('.slick-prev').click(function () {
        $('.slick-container').slickPrev();
    });

    // make the domain items clickable

});