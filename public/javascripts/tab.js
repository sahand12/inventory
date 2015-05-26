(function () {
    $(function () {
        $tabAnchor = $('.tabAnchor');

        $tabAnchor.on('click', function (e) {
            e.preventDefault();
            $this = $(this);
            if (! $this.hasClass('tabActive') ) {
                $('.tabActive').removeClass('tabActive');
                $this.addClass('tabActive');
            }
        });
    });
})();