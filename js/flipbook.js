;(function( $, window, document, undefined ) {
	
	var pluginName = 'flipbook',
		defaults = {
			'backgroundColor':'transparent',
			'backgroundPosition':'center',
			'resizeContainerToImage':false,
			'wallpaperMode':'contain'
		};
		
    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;

        // jQuery has an extend method that merges the 
        // contents of two or more objects, storing the 
        // result in the first object. The first object 
        // is generally empty because we don't want to alter 
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;

        this._defaults = defaults;
        this._name = pluginName;

        this.init();
    }

	Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element 
        // and this.options

		var self = this;
		this.currentFrame = 0;
		this.currentNotch = null;
		this.currentX = null;
		this.parentElement = $(this.element);
		this.images = {};
		this.isMobile = (/iPhone|iPod|iPad|Android|BlackBerry/).test(navigator.userAgent);
		this.notchInterval = 5;
		this.prevX = null;
		
		// STANDARDIZE WALLPAPER MODE
		switch(this.options.wallpaperMode) {
			case 'contain':
				this.options.backgroundPosition = 'center';
				this.options.backgroundSize = 'contain';
				break;
				
			case 'crop':
				this.options.backgroundPosition = 'center';
				this.options.backgroundSize = 'cover';
				break;
		}
		
		// SETUP ELEMENT
		this.parentElement.css({
			'background-color':this.options.backgroundColor,
			'background-position':this.options.backgroundPosition,
			'background-repeat':'no-repeat',
			'background-size':this.options.backgroundSize,
			'cursor':'col-resize',
			'resizeToImage':this.options.resizeToImage
		});
		
		// IF NO IMAGES, BAIL
		if(this.options.images.length == 0) { return;}
		
		// LOAD IMAGES AND START FILMSTRIP
		this.preloadImages(this.options.images,function() {			
			
			// RESIZE BOX TO IMAGE?
			if(self.options.resizeToImage) {
				self.parentElement.css({
					'height'	: self.images[self.currentFrame].height,
					'width'		: self.images[self.currentFrame].width
				});
			
			}
			
			self.showImage();
			
			// ON DRAG FOR MOBILE
			if(self.isMobile) {
				self.parentElement
				.mousedown(function() {
				    self.bindMouse();
				})
				.mouseup(function() {
				    self.unBindMouse();
				});
				
			// ON HOVER FOR DESKTOP
			}else{
				self.parentElement.hover(
					function() {
						self.bindMouse();
					},
					function() {
						self.unBindMouse();
					}
				);
			}
		});
    };

	Plugin.prototype.preloadImages = function(imgs,callback) {
		var imgs = imgs.slice(0);
		var self = this;
		$(imgs).each(function(i,v) {
			$('<img>').attr({ src: this }).load(function() {
				
				self.images[i] = {
					height	: this.height,
					src		: this.src,
					width 	: this.width
				};
				
				imgs.splice(imgs.indexOf(v),1);
				if(imgs.length == 0) { callback();}
			});
		});
	};
	
	Plugin.prototype.bindMouse = function() {
		var self = this;
		this.parentElement.bind('mousemove',function(e) {
			
			self.prevX = self.currentX;
			self.currentX = e.clientX;
			
			// IF FIRST MOVEMENT
			if(!self.currentNotch) {
				self.currentNotch = self.currentX;
				
			}else{
				
				// IF MOVING RIGHT
				if(self.currentX > self.prevX) {
					if(self.currentX >= (self.currentNotch+self.notchInterval)) {
						self.currentNotch = self.currentX;
						self.showNextImage();
					}
			
				// IF MOVING LEFT	
				}else{
					if(self.currentX <= (self.currentNotch-self.notchInterval)) {
						self.currentNotch = self.currentX;
						self.showPrevImage();
					}
				}
			}
		});
	}
	
	Plugin.prototype.showImage = function(i) {
		if(!i) { i=0;}
		
		this.parentElement.css({
			'background-image':'url(\''+this.options.images[i]+'\')'
		});
	}
	
	Plugin.prototype.showNextImage = function() {
		if(++this.currentFrame >= Object.keys(this.images).length) {
			this.currentFrame = 0;
		}
		this.showImage(this.currentFrame);
	}
	
	Plugin.prototype.showPrevImage = function() {
		if(this.currentFrame-- <= 0) {
			this.currentFrame = Object.keys(this.images).length-1;
		}
		this.showImage(this.currentFrame);
	}
	
	Plugin.prototype.unBindMouse = function() {
		this.parentElement.unbind('mousemove');
		this.currentX = null;
		this.currentNotch = null;
		this.prevX = null;
	}

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Plugin( this, options ));
            }
        });
    }
	
})(jQuery, window, document);