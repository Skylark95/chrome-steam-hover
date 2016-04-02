var steamAppPage = new RegExp("^https?://store.steampowered.com/app/([0-9]+)/?.*$"),
    tooltipDelay = 200;

/*
 * Event Listener
 */
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

/*
 * Background Page
 */
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

/*
 * Display
 */
function displayAppDetails(appid) {
    return new Promise(function(resolve, reject) {
        Promise.all([loadTemplate(), loadAppDetails(appid)]).then(function(values) {
            var template = values[0],
                data = values[1].data,
                options = values[1].options,
                hoverbox = $('<div class="sh_app"></div>');

            setAppId(hoverbox, appid);
            setTemplate(hoverbox, template);
            setHeaderImage(hoverbox, data);
            setTitle(hoverbox, data, appid, options);
            setDescription(hoverbox, data);
            setPrice(hoverbox, data);
            setPlatforms(hoverbox, data);
            setTradingCards(hoverbox, data);
            setGenere(hoverbox, data);
            setReleaseDate(hoverbox, data);

            // mouse wheel event
            hoverbox.on('wheel', handleWheelEvent);

            resolve({
                element: hoverbox
            });
        });
    });
}

/*
 * Build hoverbox
 */
function setAppId(hoverbox, appid) {
    hoverbox.attr('sh_appid', appid);
}

function setTemplate(hoverbox, template) {
    hoverbox.html(template);
}

function setHeaderImage(hoverbox, data) {
    hoverbox.find('.sh_header_image').html(data.header_image);
}

function setTitle(hoverbox, data, appid, options) {
    // title
    var title = hoverbox.find('.sh_title a');
    title.text(data.title);
    title.attr('href', 'http://store.steampowered.com/app/' + appid);

    // title too many requests
    if (data.too_many_requests) {
        title.attr('title', 'Too Many Requests');
    }

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
}

function setDescription(hoverbox, data) {
    var description = hoverbox.find('.sh_description');
    description.html(data.description);
    formatDescription(description);
}

function setPrice(hoverbox, data) {
    hoverbox.find('.sh_price_final').html(data.price_final);
    hoverbox.find('.sh_price_discount').html(data.price_discount);
    hoverbox.find('.sh_price_initial').html(data.price_initial);
}

function setPlatforms(hoverbox, data) {
    showIfTrue(hoverbox, '.sh_platform_win', data.platform_win);
    showIfTrue(hoverbox, '.sh_platform_mac', data.platform_mac);
    showIfTrue(hoverbox, '.sh_platform_linux', data.platform_linux);
}

function setTradingCards(hoverbox, data) {
    showIfTrue(hoverbox, '.sh_trading_cards', data.trading_cards);
}

function setGenere(hoverbox, data) {
    hoverbox.find('.sh_genre').html(data.genre);
}

function setReleaseDate(hoverbox, data) {
    hoverbox.find('.sh_release_date').html(data.release_date);
}

/*
 * Misc functions
 */
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

function showIfTrue(hoverbox, selector, visibility) {
    if (visibility) {
        hoverbox.find(selector).css('display', 'inline-block');
    }
}

function handleWheelEvent(event) {
    if (event.target.className !== 'sh_description') {
        var description = $(this).find('.sh_description')[0];
        description.scrollTop += event.originalEvent.deltaY;
        event.preventDefault();
    }
}

/*
 * Run It
 */
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
