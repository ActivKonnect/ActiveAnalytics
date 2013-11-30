/*vim: fileencoding=utf-8 tw=100 expandtab ts=4 sw=4 */
/*jslint indent: 4, maxlen: 100 */
/*global jQuery,_gaq,console */

// Active Analytics
// (c) 2013 ActivKonnect
// Rémy Sanchez <remy.sanchez@activkonnect.com>
// Under the terms of the WTFPL (see COPYING)

var _gaq = _gaq || [];

(function ($) {
    'use strict';

    function ActiveAnalytics(ga_uid, opts) {
        var self = this,
            gaIsLoaded,
            settings = {
                devMode: false,
                showDebug: false,
                outlinkCategory: 'Outlink',
                outlinkAction: 'Open'
            };

        function log() {
            if (settings.showDebug && console && console.log) {
                console.log.apply(console, arguments);
            }
        }

        function loadGA() {
            var gaSrc = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www')
                + '.google-analytics.com/ga.js';

            self.push(['_setAccount', ga_uid]);

            // TODO find a way not to append the timestamp to the motherfucking URL
            $.ajax({
                url: gaSrc,
                dataType: 'script',
                success: function (data, textStatus, jqXHR) {
                    if (jqXHR.status !== 200) {
                        return;
                    }

                    log('ga.js loaded');
                    gaIsLoaded = true;
                }
            });
        }

        function bindDOMEvents() {
            $(document).ready(function () {
                $('body').on('click', 'a[data-aa-event]', function (event) {
                    var aaEvent = $(this).data('aa-event'),
                        parts;

                    if (aaEvent) {
                        parts = aaEvent.split('*');

                        if (parts.length >= 2) {
                            self.push(['_trackEvent'].concat(parts));
                        } else if (aaEvent.toLowerCase() === 'outlink') {
                            self.push([
                                '_trackEvent',
                                settings.outlinkCategory,
                                settings.outlinkAction,
                                this.href
                            ]);
                        }
                    }
                });
            });
        }

        this.push = function (args) {
            var isFunc;

            if (settings.showDebug) {
                log('push', args);
            }

            isFunc = (typeof args === 'function');

            if (!settings.devMode && (gaIsLoaded || !isFunc)) {
                if (isFunc) {
                    _gaq.push(function () {
                        setTimeout(args, 100);
                    });
                } else {
                    _gaq.push(args);
                }
            } else if (isFunc) {
                args();
            }
        };

        this.trackEvent = function (category, action, label, value, nonInteraction) {
            self.push(['_trackEvent', category, action, label, value, nonInteraction]);
        };

        this.trackPage = function (page) {
            self.push(['_trackPageview', page]);
        };

        // -----------

        $.extend(settings, opts);
        bindDOMEvents();

        if (!settings.devMode) {
            loadGA();
        }
    }

    $.extend({
        aa: function (ga_uid, opts) {
            return new ActiveAnalytics(ga_uid, opts);
        }
    });
}(jQuery));
