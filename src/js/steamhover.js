var steamAppPage = new RegExp("^http://store.steampowered.com/app/([0-9]+)/?.*$"),
    tooltipDelay = 200;

function showIfTrue(hoverbox, selector, visibility) {
    if (visibility) {
        hoverbox.find(selector).css('display', 'inline-block');
    }
}

function hoverEventListener() {
    var matches = this.href.match(steamAppPage);
    if (matches && matches.length > 1) {
        var appid = matches[1],
            link = $(this);
        if (!(link.hasClass('sh_tooltip') || link.hasClass('sh_ignore'))) {
            link.addClass('sh_tooltip');
            link.tooltipster({
                content: $('<span>Loading&hellip;</span>'),
                interactive: true,
                delay: tooltipDelay
            });
            setTimeout(function() {
                link.tooltipster('show');
            }, tooltipDelay);
            displayAppDetails(appid).then(function(response) {
                link.tooltipster('content', response.element);
            });
        }
    }
}

function loadTemplate() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({operation: 'loadtemplate'}, function(response) {
            resolve(response.template);
        });
    });
}

function loadOptions() {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({operation: 'loadoptions'}, function(response) {
            resolve(response.options);
        });
    });
}

function loadAppDetails(appid) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({operation: 'appdetails', appid: appid}, function(response) {
            if (response.success) {
                resolve(response);
            } else {
                reject();
            }
        });
    });
}

function displayAppDetails(appid) {
    return new Promise(function(resolve, reject) {
        Promise.all([loadTemplate(), loadAppDetails(appid)]).then(function(values) {
            var template = values[0],
                data = values[1].data,
                options = values[1].options,
                hoverbox = $('<div class="sh_app"></div>');

            // appid
            hoverbox.attr('sh_appid', appid);

            // template
            hoverbox.html(template);

            // header
            hoverbox.find('.sh_header_image').html(data.header_image);

            // title
            var title = hoverbox.find('.sh_title a');
            title.text(data.title);
            title.attr('href', 'http://store.steampowered.com/app/' + appid);

            // title user sign in
            if (data.user_signed_in) {
                title.attr('title', 'You are signed into Steam');
            }

            // title on wishlist
            if (data.added_to_wishlist) {
                title.attr('style', 'color: ' + options.wishlist_color + ' !important');
                title.attr('title', 'On Wishlist');
            }

            // title owned
            if (data.is_owned) {
                title.attr('style', 'color: ' + options.owned_color + ' !important');
                title.attr('title', 'You already own this game');
            }

            // description
            var description = hoverbox.find('.sh_description');
            description.html(data.description);
            formatDescription(description);

            // price
            hoverbox.find('.sh_price_final').html(data.price_final);
            hoverbox.find('.sh_price_discount').html(data.price_discount);
            hoverbox.find('.sh_price_initial').html(data.price_initial);

            // platforms
            showIfTrue(hoverbox, '.sh_platform_win', data.platform_win);
            showIfTrue(hoverbox, '.sh_platform_mac', data.platform_mac);
            showIfTrue(hoverbox, '.sh_platform_linux', data.platform_linux);

            // trading cards
            showIfTrue(hoverbox, '.sh_trading_cards', data.trading_cards);

            // genre
            hoverbox.find('.sh_genre').html(data.genre);

            // release date
            hoverbox.find('.sh_release_date').html(data.release_date);

            // mouse wheel event
            hoverbox.on('wheel', handleWheelEvent);

            resolve({
                element: hoverbox
            });
        });
    });
}

function handleWheelEvent(event) {
    if (event.target.className !== 'sh_description') {
        var description = $(this).find('.sh_description')[0];
        description.scrollTop += event.originalEvent.deltaY;
        event.preventDefault();
    }
}

function formatDescription(description) {
    // Remove Images and surrounding line breaks
    description.find('img').each(function() {
        var img = $(this);
        if (img.prev().is('br')) {
            img.prev().remove();
        }
        if (img.next().is('br')) {
            img.next().remove();
        }
        img.remove();
    });

    // Replace headers with alternate style
    description.find(':header').replaceWith(function() {
        return $('<div class="sh_description_header" />').append($(this).html());
    });
}

function steamhover() {
    if (window.location.host !== 'store.steampowered.com') {
        // Load Options
        loadOptions().then(function(options) {
            tooltipDelay = options.delay;
        });

        // Install listener
        $('a[href]').mouseenter(hoverEventListener);

        // Monitor DOM changes
        new MutationSummary({
            callback: function(summaries) {
                $(summaries[0].added).mouseenter(hoverEventListener);
            },
            queries: [{
                element: "a",
                elementAttributes: "href"
            }]
        });
    }
}

steamhover();
