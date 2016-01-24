var steamAppPage = new RegExp("^http://store.steampowered.com/app/([0-9]+)/?.*$");

function showIfTrue(selector, visibility) {
    if (visibility) {
        $(selector).css('display', 'inline-block');
    }
}

function hoverEventListener() {
    if (this.href) {
        var matches = this.href.match(steamAppPage);
        if (matches && matches.length > 1) {
            var appid = matches[1],
                link = $(this);
            if (!link.hasClass('tooltip')) {
                link.addClass('tooltip');
                link.tooltipster({
                    content: $('<span>Loading&hellip;</span>')
                });
                link.tooltipster('show');
                displayAppDetails(appid).then(function() {
                    link.tooltipster('content', $($('.sh_app_' + appid).html()));
                });
            }
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
                data = values[1];

            // template
            $('body').append('<div class="sh_app sh_app_' + appid + '"></div>');
            $('.sh_app_' + appid).html(template);

            // header
            $('.sh_header_image').html(data.header_image);

            // title
            $('.sh_title').html(data.title);

            // description
            var description = $('.sh_description');
            description.html(data.description);
            description.find(':header, img, ul, br, strong').remove();
            var parts = description.text().split(' ');
            if (parts.length > 200) {
                parts = parts.slice(0, 200);
                parts.push('...');
            }
            description.html(parts.join(' '));
            description.show();

            // price
            $('.sh_price_final').html(data.price_final);
            $('.sh_price_discount').html(data.price_discount);
            $('.sh_price_initial').html(data.price_initial);

            // platforms
            showIfTrue('.sh_platform_win', data.platform_win);
            showIfTrue('.sh_platform_mac', data.platform_mac);
            showIfTrue('.sh_platform_linux', data.platform_linux);

            // genre
            $('.sh_genre').html(data.genre);

            // release date
            $('.sh_release_date').html(data.release_date);

            resolve();
        });
    });
}
$('a').mouseenter(hoverEventListener);
// displayAppDetails(getURLParam(window.location, 'appid'));
