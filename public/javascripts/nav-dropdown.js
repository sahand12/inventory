$(function() {

    var $dropdown = $('.dropdown'),
        $dropdownMenu = $('.dropdown-menu'),
        $navbarToggle = $('.navbar-toggle');

    $dropdown.hover(
        function(event) {
            var flag = $navbarToggle.is(':hidden');
            $(this).find('a.menuListItem').css({ color: '#003354' });
            if (flag) {
                $(this).find('.dropdown-toggle').addClass('dropdownBorder');
                $(this).find('.dropdown-menu').css({ padding: 0 }).show().animate({
                    'paddingTop': "30",
                    'paddingBottom': "30"
                }, 500, "easeOutQuad");
            }
        },
        function (event) {
            var flag = $navbarToggle.is(':hidden');
            $(this).find('a.menuListItem').css({ color: "white" });
            if (flag) {
                $(this).find('.dropdown-toggle').removeClass('dropdownBorder');
                $(this).find('.dropdown-menu').hide();
            }
        }
    );


    console.log( $('.navbar-toggle').is(':hidden') );
});