var steamAppPage = new RegExp("^http://store.steampowered.com/app/([0-9]+)/?.*$");

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
        if (!link.hasClass('sh_tooltip')) {
            link.addClass('sh_tooltip');
            link.tooltipster({
                content: $('<span>Loading&hellip;</span>'),
                interactive: true
            });
            link.tooltipster('show');
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

function loadAppDetails(appid) {
    return new Promise(function(resolve, reject) {
        chrome.runtime.sendMessage({operation: 'appdetails', appid: appid}, function(response) {
            if (response.success) {
                resolve(response.data);
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
                data = values[1],
                hoverbox = $('<div class="sh_app"></div>');

            // appid
            hoverbox.attr('sh_appid', appid);

            // template
            hoverbox.html(template);

            // header
            hoverbox.find('.sh_header_image').html(data.header_image);

            // title
            hoverbox.find('.sh_title').html(data.title);

            // description
            var description = hoverbox.find('.sh_description');
            description.html(data.description);
            description.find('img').remove();

            // price
            hoverbox.find('.sh_price_final').html(data.price_final);
            hoverbox.find('.sh_price_discount').html(data.price_discount);
            hoverbox.find('.sh_price_initial').html(data.price_initial);

            // platforms
            showIfTrue(hoverbox, '.sh_platform_win', data.platform_win);
            showIfTrue(hoverbox, '.sh_platform_mac', data.platform_mac);
            showIfTrue(hoverbox, '.sh_platform_linux', data.platform_linux);

            // genre
            hoverbox.find('.sh_genre').html(data.genre);

            // release date
            hoverbox.find('.sh_release_date').html(data.release_date);

            // mouse wheel event
            hoverbox.on('wheel', handleScrollEvent);

            resolve({
                element: hoverbox
            });
        });
    });
}

function handleScrollEvent(event) {
    if (event.target.className !== 'sh_description') {
        var description = $(this).find('.sh_description')[0];
        description.scrollTop += event.originalEvent.deltaY;
        event.preventDefault();
    }
}

function steamhover() {
    if (window.location.host !== 'store.steampowered.com') {
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
