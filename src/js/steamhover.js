var steamAppPage = new RegExp("^http://store.steampowered.com/app/([0-9]+)/?.*$");

function showIfTrue(selector, visibility) {
    if (visibility) {
        $(selector).css('display', 'inline-block');
    }
}

function getURLParam(oTarget, sVar) {
    return decodeURI(oTarget.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function hoverEventListener() {
    if (this.href) {
        var matches = this.href.match(steamAppPage);
        if (matches && matches.length > 1) {
            var appid = matches[1];
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
    Promise.all([loadTemplate(), loadAppDetails(appid)]).then(function(values) {
        var template = values[0],
            data = values[1];

        // template
        $('body').append(template);

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
    });
}

displayAppDetails(getURLParam(window.location, 'appid'));
