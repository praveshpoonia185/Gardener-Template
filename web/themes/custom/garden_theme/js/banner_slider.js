(function ($, Drupal) {

    "use strict";
    Drupal.behaviors.webshoptheme = {
        attach: function (context, settings) {
            $(document).ready(function () {
                $('.bannerone-slider').slick({
                    prevArrow: '<span class="slick-prev"></span>',
                    nextArrow: '<span class="slick-next"></span>',
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    autoplay: true,
                    autoplaySpeed: 1500,
                    arrows: true,
                    responsive: [{
                        breakpoint: 992,
                        slidesToShow: 1,
                        slidesToScroll: 1,
                        autoplay: true,
                        autoplaySpeed: 1500,
                        arrows: true,

                    }, {
                        breakpoint: 768,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            autoplay: true,
                            autoplaySpeed: 1500,
                            arrows: true,
                        }
                    }, {
                        breakpoint: 576,
                        settings: {
                            slidesToShow: 1,
                            slidesToScroll: 1,
                            autoplay: true,
                            autoplaySpeed: 1500,
                            arrows: true,
                        }
                    }]
                });
            });
        }
    };


})(jQuery, Drupal);
