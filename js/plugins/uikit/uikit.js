/*! UIkit 2.3.1 | https://www.getuikit.com | (c) 2014 YOOtheme | MIT License */
/*jshint new: true */
/*global $, jQuery, document, window, navigator*/

(function ($, doc, global) {

    "use strict";

    var UI = $.UIkit || {}, $html = $("html"), $win = $(window);

    if (UI.fn) {
        return;
    }

    UI.fn = function (command, options) {

        var args = arguments, cmd = command.match(/^([a-z\-]+)(?:\.([a-z]+))?/i), component = cmd[1], method = cmd[2];

        if (!UI[component]) {
            $.error("UIkit component [" + component + "] does not exist.");
            return this;
        }

        return this.each(function () {
            var $this = $(this), data = $this.data(component);
            if (!data) {
                $this.data(component, (data = new UI[component](this, method ? undefined : options)));
            }
            if (method) {
                data[method].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    };


    UI.support = {};

    UI.support.requestAnimationFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.msRequestAnimationFrame || global.oRequestAnimationFrame || function (callback) { global.setTimeout(callback, 1000 / 60); };
    UI.support.touch                 = (
        ('ontouchstart' in window && navigator.userAgent.toLowerCase().match(/mobile|tablet/)) ||
        (global.DocumentTouch && document instanceof global.DocumentTouch)  ||
        (global.navigator['msPointerEnabled'] && global.navigator['msMaxTouchPoints'] > 0) || //IE 10
        (global.navigator['pointerEnabled'] && global.navigator['maxTouchPoints'] > 0) || //IE >=11
        false
    );
    UI.support.mutationobserver      = (global.MutationObserver || global.WebKitMutationObserver || global.MozMutationObserver || null);

    UI.Utils = {};

    UI.Utils.debounce = function (func, wait, immediate) {
        var timeout;
        return function () {
            var context, later;
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    };

    UI.Utils.isInView = function(element, options) {

        var $element = $(element);

        if (!$element.is(':visible')) {
            return false;
        }

        var window_left = $win.scrollLeft(), window_top = $win.scrollTop(), offset = $element.offset(), left = offset.left, top = offset.top;

        options = $.extend({topoffset:0, leftoffset:0}, options);

        if (top + $element.height() >= window_top && top - options.topoffset <= window_top + $win.height() &&
            left + $element.width() >= window_left && left - options.leftoffset <= window_left + $win.width()) {
          return true;
        } else {
          return false;
        }
    };

    UI.Utils.options = function(string) {

        if ($.isPlainObject(string)) return string;

        var start = (string ? string.indexOf("{") : -1), options = {};

        if (start != -1) {
            try {
                options = (new Function("", "var json = " + string.substr(start) + "; return JSON.parse(JSON.stringify(json));"))();
            } catch (e) {}
        }

        return options;
    };

    $.UIkit = UI;
    $.fn.uk = UI.fn;


    $(function(){

        $(doc).trigger("uk-domready");

        // Check for dom modifications
        if(!UI.support.mutationobserver) return;

        var observer = new UI.support.mutationobserver(UI.Utils.debounce(function(mutations) {
            $(doc).trigger("uk-domready");
        }, 300));

        // pass in the target node, as well as the observer options
        observer.observe(document.body, { childList: true, subtree: true });

        // remove css hover rules for touch devices
        if (UI.support.touch) {
            //UI.Utils.removeCssRules(/\.uk-(?!navbar).*:hover/);
        }
    });


})(jQuery, document, window);



(function($, UI) {

    "use strict";

    var $win           = $(window),
        scrollspies    = [],
        checkScrollSpy = function() {
            for(var i=0; i < scrollspies.length; i++) {
                UI.support.requestAnimationFrame.apply(window, [scrollspies[i].check]);
            }
        },

        ScrollSpy = function(element, options) {

            var $element = $(element);

            if($element.data("scrollspy")) return;

            this.options = $.extend({}, ScrollSpy.defaults, options);
            this.element = $(element);

            var $this = this, idle, inviewstate, initinview,
                fn = function(){

                    var inview = UI.Utils.isInView($this.element, $this.options);

                    if(inview && !inviewstate) {

                        if(idle) clearTimeout(idle);

                        if(!initinview) {
                            $this.element.addClass($this.options.initcls);
                            $this.offset = $this.element.offset();
                            initinview = true;

                            $this.element.trigger("uk-scrollspy-init");
                        }

                        idle = setTimeout(function(){

                            if(inview) {
                                $this.element.addClass("uk-scrollspy-inview").addClass($this.options.cls).width();
                            }

                        }, $this.options.delay);

                        inviewstate = true;
                        $this.element.trigger("uk.scrollspy.inview");
                    }

                    if (!inview && inviewstate && $this.options.repeat) {
                        $this.element.removeClass("uk-scrollspy-inview").removeClass($this.options.cls);
                        inviewstate = false;

                        $this.element.trigger("uk.scrollspy.outview");
                    }
                };

            fn();

            this.element.data("scrollspy", this);

            this.check = fn;
            scrollspies.push(this);
        };

    ScrollSpy.defaults = {
        "cls"        : "uk-scrollspy-inview",
        "initcls"    : "uk-scrollspy-init-inview",
        "topoffset"  : 0,
        "leftoffset" : 0,
        "repeat"     : false,
        "delay"      : 0
    };


    UI["scrollspy"] = ScrollSpy;


    var fnCheck = function(){
        checkScrollSpy();
    };

    // listen to scroll and resize
    $win.on("scroll", fnCheck).on("resize orientationchange", UI.Utils.debounce(fnCheck, 50));

    // init code
    $(document).on("uk-domready", function(e) {
        $("[data-uk-scrollspy]").each(function() {

            var element = $(this);

            if (!element.data("scrollspy")) {
                var obj = new ScrollSpy(element, UI.Utils.options(element.attr("data-uk-scrollspy")));
            }
        });

    });

})(jQuery, jQuery.UIkit);