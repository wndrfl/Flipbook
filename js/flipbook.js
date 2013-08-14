/**
 * Flipbook - jQuery Plugin
 * version 1.0.0
 * 
 * Copyright 2013 Wonderful Co.
 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
 **/

;(function($) {
	
	var Flipbook = function(el,options) {
		
		var $flipbook = this;
		
		// settings and local vars
		var settings = $.extend({}, $.fn.flipbook.defaults, options);
		
		var vars = {
			backgroundPosition	: 'center',
			backgroundSize		: 'cover',
			currentFrame		: 0,
			currentNotch		: null,
			currentX			: null,
			isMobile 			: (function(a){ return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|ipad|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera),
			isPlaying			: false,
			notchInterval		: 5,
			playTimer			: null,
			prevFrame			: null,
			prevX				: null
		};
		
		var $parent = $(el);
		
		var analyzeMovement = function(x) {
			vars.prevX = vars.currentX;
			vars.currentX = x;

			// if first movement
			if(!vars.currentNotch) {
				vars.currentNotch = vars.currentX;

			}else{

				// if moving right
				if(vars.currentX > vars.prevX) {
					if(vars.currentX >= (vars.currentNotch+vars.notchInterval)) {
						vars.currentNotch = vars.currentX;
						showNextImage();
					}

				// if moving left	
				}else{
					if(vars.currentX <= (vars.currentNotch-vars.notchInterval)) {
						vars.currentNotch = vars.currentX;
						showPrevImage();
					}
				}
			}
		}

		var bindMouse = function() {

			if(vars.isPlaying) {
				stopFlipbook();
			}

			if(vars.isMobile) {
				$parent.bind('touchmove',function(e) {
					e.preventDefault();
					var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
					analyzeMovement(touch.clientX);
				});
			}else{
				$parent.bind('mousemove',function(e) {
					analyzeMovement(e.clientX);
				});
			}
		}
		
		var playFlipbook = function() {
			vars.isPlaying = true;
			var interval = 1000/settings.frameRate;
			vars.playTimer = setInterval(function() {
				showNextImage();
			},interval);
		}
		
		var preloadImages = function(imgs,callback) {
			var imgs = imgs.slice(0);
			
			$(imgs).each(function(i,v) {
				$('<img>').attr({ src: this }).load(function() {

					settings.images[i] = {
						height	: this.height,
						src		: this.src,
						width 	: this.width
					};

					imgs.splice(imgs.indexOf(v),1);

					var div = document.createElement("div");
					div.className = "flipbook-frame flipbook-frame-"+i;
					div.style.width = "100%";
					div.style.height = "100%";
					div.style.position = "absolute";

					div.style.backgroundImage = "url('"+this.src+"')";
					div.style.backgroundPosition = vars.backgroundPosition;
					div.style.backgroundRepeat = "no-repeat";
					div.style.backgroundSize = vars.backgroundSize;

					div.style.display = "none";

					$parent.append(div);

					if(imgs.length == 0) { callback();}
				});
			});
		}
		
		var setup = function() {
			
			// if no images, bail
			if(settings.images.length == 0) { return;}
		
			// pick wallpaper mode
			switch(settings.wallpaperMode) {
				case 'contain':
					vars.backgroundPosition = 'center';
					vars.backgroundSize = 'contain';
					break;
				
				case 'crop':
					vars.backgroundPosition = 'center';
					vars.backgroundSize = 'cover';
					break;
			}
		
			// setup parent
			$parent.css({
				'background-color'	: settings.backgroundColor,
				'cursor'			: 'col-resize',
			});
			if($parent.css('position') != 'absolute') {
				$parent.css('position','relative');
			}
		
			// preload images and go
			preloadImages(settings.images,function() {			
			
				showImage();
			
				// autoplay?
				if(settings.autoplay) {
					playFlipbook();
				}
			
				// on drag for mobile
				if(vars.isMobile) {
					$parent.bind('touchstart',function() {
					    bindMouse();
					})
					.bind('touchend',function() {
					    unBindMouse();
					});
				
				// on hover for desktop
				}else{
					$parent.hover(
						function() {
							bindMouse();
						},
						function() {
							unBindMouse();
						}
					);
				}
			});
		};
		
		var showImage = function(i) {
			
			if(!i) { i=0;}

			if(vars.prevFrame) {
				$parent.children('.flipbook-frame-'+vars.prevFrame).hide();
			}

			$parent.children('.flipbook-frame-'+i).css({
				'display':'block'
			});
		}
		
		var showNextImage = function() {
			vars.prevFrame = vars.currentFrame;
			if(++vars.currentFrame >= Object.keys(settings.images).length) {
				vars.currentFrame = 0;
			}
			showImage(vars.currentFrame);
		}

		var showPrevImage = function() {
			vars.prevFrame = vars.currentFrame;
			if(vars.currentFrame-- <= 0) {
				vars.currentFrame = Object.keys(settings.images).length-1;
			}
			showImage(vars.currentFrame);
		}

		var stopFlipbook = function() {
			vars.isPlaying = false;
			clearInterval(vars.playTimer);
		}

		var unBindMouse = function() {
			$parent.unbind('mousemove');
			$parent.unbind('touchmove');
			vars.currentX = null;
			vars.currentNotch = null;
			vars.prevFrame = null;
			vars.prevX = null;

			// RETURN TO PLAY?
			if(settings.autoplay) {
				playFlipbook();
			}
		}
		
		setup();
	}
	
	// plug it in
	$.fn.flipbook = function(options) {
        return this.each(function(key, value){
            var element = $(this);
            // Return early if this element already has a plugin instance
            if (element.data('flipbook')) { return element.data('flipbook'); }
            // Pass options to plugin constructor
            var flipbook = new Flipbook(this, options);
            // Store plugin object in this element's data
            element.data('flipbook', flipbook);
        });
    };

	$.fn.flipbook.defaults = {
		'autoplay'				: false,
		'backgroundColor'		: 'transparent',
		'backgroundPosition'	: 'center',
		'fadeFrames'			: false,
		'fadeFramesRate'		: null,
		'frameRate'				: 24,
		'images'				: {},
		'resizeContainerToImage': false,
		'wallpaperMode'			: 'contain'
    };
	
}(jQuery));