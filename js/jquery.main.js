// Menu toggle 
jQuery(document).ready(function(){
	jQuery('#nav-opener').click(function(){
        jQuery(this).toggleClass('open');
        jQuery('body').toggleClass('menu-active');
    });
});


jQuery(function() {
	initLoadMore();
	initTabs();
});


// load more init
function initLoadMore() {
	jQuery('.load-more-holder').loadMore({
		linkSelector: 'a.load-more'
	});
}

// content tabs init
function initTabs() {
	jQuery('#timeline').tabset({
		tabLinks: '.a-opener',
		event: 'mouseenter',
	});
}

/*
 * jQuery Load More plugin
 */
;(function($, $win) {

	'use strict';

	var ScrollLoader = {
		attachEvents: function() {
			var self = this;

			$win.on('load.ScrollLoader resize.ScrollLoader orientationchange.ScrollLoader', function() { self.onResizeHandler(); });
			$win.on('scroll.ScrollLoader', function() { self.onScrollHandler(); });
			this.$holder.on('ContentLoader/loaded.ScrollLoader', function() { self.onResizeHandler(); });

			this.winProps = {};
			this.holderProps = {};
			this.onResizeHandler();
		},

		onResizeHandler: function() {
			this.winProps.height = $win.height();
			this.holderProps.height = this.$holder.outerHeight();
			this.holderProps.offset = this.$holder.offset().top;

			this.onScrollHandler();
		},

		onScrollHandler: function() {
			this.winProps.scroll = $win.scrollTop();

			if (this.winProps.scroll + this.winProps.height + Math.min(1, this.options.additionBottomOffset) > this.holderProps.height + this.holderProps.offset) {
				this.loadInclude();
			}
		},

		destroySubEvents: function() {
			$win.off('.ScrollLoader');
			this.$holder.off('.ScrollLoader');
		}
	};

	var ClickLoader = {
		attachEvents: function() {
			var self = this;

			this.$holder.on('click.ClickLoader', this.options.linkSelector, function(e) { self.onClickHandler(e); });
		},

		onClickHandler: function(e) {
			e.preventDefault();

			this.loadInclude();
		},

		destroySubEvents: function() {
			this.$holder.off('.ClickLoader');
		}
	};

	var ContentLoader = function($holder, options) {
		this.$holder = $holder;
		this.options = options;

		this.init();
	};

	var ContentLoaderProto = {
		init: function() {
			this.$link = this.$holder.find(this.options.linkSelector);
			this.$newContentTarget = this.options.newContentTarget ? this.$holder.find(this.options.newContentTarget) : this.$holder;

			if (!this.$link.length) {
				this.removeInstance();
				return;
			}

			this.attachEvents();
		},

		loadInclude: function() {
			if (this.isBusy) {
				return;
			}

			var self = this;

			this.toggleBusyMode(true);

			$.get(self.$link.attr('href'), function(source) { self.successHandler(source); });
		},

		successHandler: function(include) {
			var $tmpDiv = jQuery('<div>').html(include);
			var $nextIncludeLink = $tmpDiv.find(this.options.linkSelector);

			if ($nextIncludeLink.length) {
				this.refreshLink($nextIncludeLink);
			} else {
				this.destroy();
			}

			this.appendItems($tmpDiv.children());
		},

		appendItems: function($newItems) {
			var self = this;

			this.$newContentTarget.append($newItems.addClass(this.options.preAppendClass));

			setTimeout(function() { // need this timeout coz need some time for css preAppendClass applied to the new items
				$newItems.removeClass(self.options.preAppendClass);

				self.toggleBusyMode(false);
				self.$holder.trigger('ContentLoader/loaded');
			}, 100);

			if (window.picturefill) {
				window.picturefill();
			}
		},

		refreshLink: function($nextIncludeLink) {
			this.$link.attr('href', $nextIncludeLink.attr('href'));
			$nextIncludeLink.remove();
		},

		toggleBusyMode: function(state) {
			this.$holder.toggleClass(this.options.busyClass, state);
			this.isBusy = state;
		},

		removeInstance: function() {
			this.$holder.removeData('ContentLoader');
		},

		destroy: function() {
			this.removeInstance();
			this.destroySubEvents();

			this.$link.remove();
		}
	};

	$.fn.loadMore = function(opt) {
		var args = Array.prototype.slice.call(arguments);
		var method = args[0];

		var options = $.extend({
			scroll: false,
			linkSelector: '.load-more',
			newContentTarget: null,
			busyClass: 'is-busy',
			additionBottomOffset: 50,
			preAppendClass: 'new-item'
		}, opt);

		return this.each(function() {
			var $holder = jQuery(this);
			var instance = $holder.data('ContentLoader');

			if (typeof opt === 'object' || typeof opt === 'undefined') {
				ContentLoader.prototype = $.extend(options.scroll ? ScrollLoader : ClickLoader, ContentLoaderProto);

				$holder.data('ContentLoader', new ContentLoader($holder, options));
			} else if (typeof method === 'string' && instance) {
				if (typeof instance[method] === 'function') {
					args.shift();
					instance[method].apply(instance, args);
				}
			}
		});
	};
}(jQuery, jQuery(window)));

/*
 * jQuery Tabs plugin
 */
;(function($, $win) {
	'use strict';

	function Tabset($holder, options) {
		this.$holder = $holder;
		this.options = options;

		this.init();
	}

	Tabset.prototype = {
		init: function() {
			this.$tabLinks = this.$holder.find(this.options.tabLinks);

			this.setStartActiveIndex();
			this.setActiveTab();

			if (this.options.autoHeight) {
				this.$tabHolder = $(this.$tabLinks.eq(0).attr(this.options.attrib)).parent();
			}
		},

		setStartActiveIndex: function() {
			var $activeLink = this.$tabLinks.filter('.' + this.options.activeClass);
			var $hashLink = this.$tabLinks.filter('[' + this.options.attrib + '="' + location.hash + '"]');
			var activeIndex;

			if (this.options.checkHash && $hashLink.length) {
				$activeLink = $hashLink;
			}

			activeIndex = this.$tabLinks.index($activeLink);

			this.activeTabIndex = this.prevTabIndex = (activeIndex === -1 ? 0 : activeIndex);
		},

		setActiveTab: function() {
			var self = this;

			this.$tabLinks.each(function(i, link) {
				var $link = $(link);
				var $classTarget = self.getClassTarget($link);
				var $tab = $($link.attr(self.options.attrib));

				if (i !== self.activeTabIndex) {
					$classTarget.removeClass(self.options.activeClass);
					$tab.addClass(self.options.tabHiddenClass).removeClass(self.options.activeClass);
				} else {
					$classTarget.addClass(self.options.activeClass);
					$tab.removeClass(self.options.tabHiddenClass).addClass(self.options.activeClass);
				}

				self.attachTabLink($link, i);
			});
		},

		attachTabLink: function($link, i) {
			var self = this;

			$link.on(this.options.event + '.tabset', function(e) {
				e.preventDefault();

				if (self.activeTabIndex === self.prevTabIndex && self.activeTabIndex !== i) {
					self.activeTabIndex = i;
					self.switchTabs();
				}
			});
		},
		
		resizeHolder: function(height) {
			var self = this;

			if (height) {
				this.$tabHolder.height(height);
				setTimeout(function() {
					self.$tabHolder.addClass('transition');
				}, 10);
			} else {
				self.$tabHolder.removeClass('transition').height('');
			}
		},

		switchTabs: function() {
			var self = this;

			var $prevLink = this.$tabLinks.eq(this.prevTabIndex);
			var $nextLink = this.$tabLinks.eq(this.activeTabIndex);

			var $prevTab = this.getTab($prevLink);
			var $nextTab = this.getTab($nextLink);

			$prevTab.removeClass(this.options.activeClass);

			if (self.haveTabHolder()) {
				this.resizeHolder($prevTab.outerHeight());
			}

			setTimeout(function() {
				self.getClassTarget($prevLink).removeClass(self.options.activeClass);

				$prevTab.addClass(self.options.tabHiddenClass);
				$nextTab.removeClass(self.options.tabHiddenClass).addClass(self.options.activeClass);

				self.getClassTarget($nextLink).addClass(self.options.activeClass);

				if (self.haveTabHolder()) {
					self.resizeHolder($nextTab.outerHeight());

					setTimeout(function() {
						self.resizeHolder();
						self.prevTabIndex = self.activeTabIndex;
					}, self.options.animSpeed);
				} else {
					self.prevTabIndex = self.activeTabIndex;
				}
			}, this.options.autoHeight ? this.options.animSpeed : 1);
		},

		getClassTarget: function($link) {
			return this.options.addToParent ? $link.parent() : $link;
		},

		getActiveTab: function() {
			return this.getTab(this.$tabLinks.eq(this.activeTabIndex));
		},

		getTab: function($link) {
			return $($link.attr(this.options.attrib));
		},

		haveTabHolder: function() {
			return this.$tabHolder && this.$tabHolder.length;
		},

		destroy: function() {
			var self = this;

			this.$tabLinks.off('.tabset').each(function() {
				var $link = $(this);

				self.getClassTarget($link).removeClass(self.options.activeClass);
				$($link.attr(self.options.attrib)).removeClass(self.options.activeClass + ' ' + self.options.tabHiddenClass);
			});

			this.$holder.removeData('Tabset');
		}
	};

	$.fn.tabset = function(options) {
		options = $.extend({
			activeClass: 'active',
			addToParent: false,
			autoHeight: false,
			checkHash: false,
			animSpeed: 500,
			tabLinks: 'a',
			attrib: 'href',
			event: 'click',
			tabHiddenClass: 'js-tab-hidden'
		}, options);
		options.autoHeight = options.autoHeight && $.support.opacity;

		return this.each(function() {
			var $holder = $(this);

			if (!$holder.data('Tabset')) {
				$holder.data('Tabset', new Tabset($holder, options));
			}
		});
	};
}(jQuery, jQuery(window)));