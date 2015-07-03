$(function() {

    var $dropdown = $('.dropdown'),
        $dropdownMenu = $('.dropdown-menu'),
        hoverColor = "rgb(46, 46, 46)",
        normalColor;
        $navbarToggle = $('.navbar-toggle');

    $dropdown.hover(
        function(event) {
            var flag = $navbarToggle.is(':hidden');
            var $hoveredAnchor = $(this).find('a.menu-list-item');
            normalColor = $hoveredAnchor.css('color');

            $hoveredAnchor.css({ color: hoverColor });
            if (flag) {
                $(this).find('.dropdown-menu').addClass('dropdown-list');
                $(this).find('.dropdown-menu')
                    .css({ padding: 0 })
                    .show()
                    .animate({
                        'paddingTop': "30",
                        'paddingBottom': "30"
                    }, 500, "easeOutQuad");
            }
        },
        function (event) {
            var flag = $navbarToggle.is(':hidden');
            $(this).find('a.menu-list-item').css({ color: normalColor });
            if (flag) {
                $(this).find('.dropdown-menu').removeClass('dropdown-list');
                $(this).find('.dropdown-menu').hide();
            }
        }
    );


    //console.log( $('.navbar-toggle').is(':hidden') );
});