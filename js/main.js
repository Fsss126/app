$(document).ready(function($){
	var contentSections = $('.cd-section'),
		navigationItems = $('#cd-vertical-nav a');

	var dots = [];
	// var initialOffset = $('.cd-dot:first').offset().top;
    var dotsObj = $('li a');
	dotsObj.each(function () {
		dots.push($(this).offset().top - $(window).scrollTop());
    });
	$.each(dots, function (key, obj) {
		console.log(key + ' ' + obj);
    });
	// console.log(initialOffset);

	updateNavigation();
	$(window).on('scroll', function(){
		updateNavigation();
		// console.log(($(window).height() - $(window).scrollTop()) + ' ' + (initialOffset));
		// var offset = Math.abs($(window).height() - $(window).scrollTop()) % $(window).height();
		var offset = ($(window).scrollTop() % $(window).height());
		console.log(($(window).scrollTop() % $(window).height()));
		var order = parseInt($(window).scrollTop() / $(window).height(), 10) % 2;
        // console.log(order);
        if (order == 0)
		{
            dotsObj.each(function () {
                // for(var i = 0; i < dots.length; i++)
                // 	if (dots[i] > offset)
                // 		console.log('*');
                if (dots[$(this).attr('data-number') - 1] > $(window).height() - offset - 10)
                    $(this).addClass('reversed');
                else
                    $(this).removeClass('reversed');
            });
		}
		else {
            dotsObj.each(function () {
                // for(var i = 0; i < dots.length; i++)
                // 	if (dots[i] > offset)
                // 		console.log('*');
                if (dots[$(this).attr('data-number') - 1] > $(window).height() - offset - 10)
                    $(this).removeClass('reversed');
                else
                    $(this).addClass('reversed');
            });
		}
        if ($(window).scrollTop() > 150)
        {
            if (!$('.top-menu').hasClass('shrink'))
                $('.top-menu').addClass('shrink');
        }
        else {
            if ($('.top-menu').hasClass('shrink'))
                $('.top-menu').removeClass('shrink');
        }
	});

    // var scroll = true;
    // var section = $('section').first();
    // var lastScrollTop = 0;
    // $(window).scroll(function(event){
    //     if (scroll)
		// {
    //         var st = $(this).scrollTop();
    //         if (st > lastScrollTop){
    //             // downscroll code
    //             smoothScroll(section.next());
    //         } else {
    //             // upscroll code
    //             smoothScroll(section.prev());
    //         }
    //         // scroll = false;
		// }
    //     lastScrollTop = st;
    // });

    // $('section').mousewheel(function(e) {
    //     // $('p').text(e.deltaY);
    //     //
    //     if (e.deltaY>0) {
    //         console.log('up');
    //     }
    //     else console.log('down');
    //
    //     e.preventDefault();
    //     if (scroll)
		// {
    //         if (e.deltaY>0) {
    //             smoothScroll($(this).prev());
    //             scroll = false;
    //         }
    //         else {
    //             smoothScroll($(this).next());
    //             scroll = false;
    //         }
    //         setTimeout(function () {
    //             scroll = true;
    //         }, 3000);
		// }
    // });

	//smooth scroll to the section
	navigationItems.on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });
    //smooth scroll to second section
    $('.cd-scroll-down').on('click', function(event){
        event.preventDefault();
        smoothScroll($(this.hash));
    });

    //open-close navigation on touch devices
    $('.touch .cd-nav-trigger').on('click', function(){
    	$('.touch #cd-vertical-nav').toggleClass('open');
  
    });
    //close navigation on touch devices when selectin an elemnt from the list
    $('.touch #cd-vertical-nav a').on('click', function(){
    	$('.touch #cd-vertical-nav').removeClass('open');
    });

	function updateNavigation() {
		contentSections.each(function(){
			$this = $(this);
			var activeSection = $('#cd-vertical-nav a[href="#'+$this.attr('id')+'"]').data('number') - 1;
			if ( ( $this.offset().top - $(window).height()/2 < $(window).scrollTop() ) && ( $this.offset().top + $this.height() - $(window).height()/2 > $(window).scrollTop() ) ) {
				navigationItems.eq(activeSection).addClass('is-selected');
			}else {
				navigationItems.eq(activeSection).removeClass('is-selected');
			}
		});
	}

	function smoothScroll(target) {
        $('body, html').animate(
        	{'scrollTop':target.offset().top},
        	600
        );
	}
});