function formatPrice(price, locale, currency) {
    var num = price / 100;
    return num.toLocaleString(locale, { style: 'currency', currency: currency });
}

function templateListener(request, sender, sendResponse) {
    if (request.operation === 'loadtemplate') {
        $.get(chrome.extension.getURL('/html/sh_container.html')).done(function(data) {
            sendResponse({
                template: data
            });
        });
        return true;
    }
}

function appdetailsListener(request, sender, sendResponse) {
    if (request.operation === 'appdetails' && request.appid) {
        var appid = request.appid,
            response = {},
            promise = $.get('http://store.steampowered.com/api/appdetails/?filters=basic,price_overview,platforms,genres,release_date&appids=' + appid);

        response.success = false;
        response.data = {};

        promise.done(function(data) {
            if (data) {
                response.success = data[appid].success;

                if (response.success) {
                    var appdetails = data[appid].data,
                        locale = 'en-US',
                        platforms = appdetails.platforms;

                    // header
                    response.data.header_image = '<img src="' + appdetails.header_image + '"/>';

                    // title
                    response.data.title = appdetails.name;

                    // description
                    response.data.description = appdetails.about_the_game;

                    // price
                    response.data.price_discount = '';
                    response.data.price_initial = '';
                    if (appdetails.is_free) {
                        response.data.price_final = 'FREE';
                    } else {
                        var price = appdetails.price_overview,
                            currency = price.currency;
                        response.data.price_final = formatPrice(price.final, locale, currency);
                        if (price.discount_percent && price.discount_percent > 0) {
                            response.data.price_discount = '(' + price.discount_percent + '%)';
                            response.data.price_initial = formatPrice(price.initial, locale, currency);
                        }
                    }

                    // platforms
                    response.data.platform_win = platforms.windows;
                    response.data.platform_mac = platforms.mac;
                    response.data.platform_linux = platforms.linux;

                    // genre
                    if (appdetails.genres && appdetails.genres.length > 0) {
                        response.data.genre = appdetails.genres[0].description;
                    } else {
                        response.data.genre = 'Uncategorized';
                    }

                    // release date
                    if (appdetails.release_date && appdetails.release_date.coming_soon === false) {
                        response.data.release_date = appdetails.release_date.date;
                    } else {
                        response.data.release_date = 'Coming Soon';
                    }
                }
            }
        });

        promise.always(function() {
            sendResponse(response);
        });

        return true;
    }
}

chrome.runtime.onMessage.addListener(templateListener);
chrome.runtime.onMessage.addListener(appdetailsListener);
