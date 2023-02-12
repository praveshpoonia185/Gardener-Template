/**
 * @file
 * Global utilities.
 *
 */
(function ($, Drupal) {

	var a = 0;
	$(window).scroll(function() {

		if ($('#counter').length) {
		  var oTop = $('#counter').offset().top - window.innerHeight;
		  if (a == 0 && $(window).scrollTop() > oTop) {
		    $('.counter-value').each(function() {
		      var $this = $(this),
		        countTo = $this.attr('data-count');
		        duration = $this.attr('data-duration');
		      $({
		        countNum: $this.text()
		      }).animate({
		          countNum: countTo
		        },

		        {

		          duration: parseInt(duration),
		          easing: 'swing',
		          step: function() {
		            $this.text(Math.floor(this.countNum));
		          },
		          complete: function() {
		            $this.text(this.countNum);
		          }

		        });
		    });
		    a = 1;
		  }
		}
	});


})(jQuery, Drupal);
