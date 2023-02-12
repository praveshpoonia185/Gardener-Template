(function ($, Drupal) {

    "use strict";
    Drupal.behaviors.webshopth = {
        attach: function (context, settings) {
            $(document).ready(function () {
                $('.field--name-field-testimonials-grid').slick({
                    prevArrow: '<span class="slick-p"></span>',
                    nextArrow: '<span class="slick-n"></span>',
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
