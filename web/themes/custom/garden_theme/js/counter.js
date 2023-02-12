const counter = ($) => {
    $(document).ready(function () {
        $('.field--name-field-counter-heading').counterUp({
            delay: 10,
            time: 1000
        });
    });
};
counter(jQuery);