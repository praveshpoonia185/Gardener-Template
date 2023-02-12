const navbar = ($) => {
    $(document).ready(function () {
        $('.sidebarbtn').click(function () {
            $('.sidebar').toggleClass('active')
            $('.sidebarbtn').toggleClass('toggle')
        })
    });
};
navbar(jQuery);