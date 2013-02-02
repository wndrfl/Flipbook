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
		this.isMobile = (function(a){ return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|ipad|iemobile|ip(ad|hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))})(navigator.userAgent||navigator.vendor||window.opera);
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
			'cursor':'col-resize',
			'position':'relative',
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
				.bind('touchstart',function() {
				    self.bindMouse();
				})
				.bind('touchend',function() {
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
				
				var div = document.createElement("div");
				div.className = "flipbook-frame flipbook-frame-"+i;
				div.style.width = "100%";
				div.style.height = "100%";
				div.style.position = "absolute";
				
				div.style.backgroundImage = "url('"+this.src+"')";
				div.style.backgroundPosition = self.options.backgroundPosition;
				div.style.backgroundRepeat = "no-repeat";
				div.style.backgroundSize = self.options.backgroundSize;
				
				div.style.display = "none";
				
				self.parentElement.append(div);
				
				if(imgs.length == 0) { callback();}
			});
		});
	};
	
	Plugin.prototype.analyzeMovement = function(x) {
		this.prevX = this.currentX;
		this.currentX = x;
	
		// IF FIRST MOVEMENT
		if(!this.currentNotch) {
			this.currentNotch = this.currentX;
		
		}else{
		
			// IF MOVING RIGHT
			if(this.currentX > this.prevX) {
				if(this.currentX >= (this.currentNotch+this.notchInterval)) {
					this.currentNotch = this.currentX;
					this.showNextImage();
				}
	
			// IF MOVING LEFT	
			}else{
				if(this.currentX <= (this.currentNotch-this.notchInterval)) {
					this.currentNotch = this.currentX;
					this.showPrevImage();
				}
			}
		}
	}
	
	Plugin.prototype.bindMouse = function() {
		var self = this;
		
		if(this.isMobile) {
			this.parentElement.bind('touchmove',function(e) {
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				self.analyzeMovement(touch.clientX);
			});
		}else{
			this.parentElement.bind('mousemove',function(e) {
				self.analyzeMovement(e.clientX);
			});
		}
	}
	
	Plugin.prototype.showImage = function(i) {
		if(!i) { i=0;}
		
		this.parentElement.children('.flipbook-frame').hide();
		this.parentElement.children('.flipbook-frame-'+i).css('display','block');
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
		this.parentElement.unbind('touchmove');
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