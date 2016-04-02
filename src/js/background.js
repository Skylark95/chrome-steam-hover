// Constants
const TRADING_CARDS_ID = 29;

// Open help page on install
chrome.runtime.onInstalled.addListener(function(details) {
    if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
        chrome.tabs.create({url: 'https://skylark95.github.io/chrome-steam-hover/installed/'});
    } else if (details.reason === chrome.runtime.OnInstalledReason.UPDATE && details.previousVersion.startsWith("1.0")) {
        chrome.tabs.create({url: 'https://skylark95.github.io/chrome-steam-hover/update/1.1/'});
    }
});

function formatPrice(price, locale, currency) {
    var num = price / 100;
    return num.toLocaleString(locale, { style: 'currency', currency: currency });
}

function loadOptions() {
    return new Promise(function(resolve, reject) {
        chrome.storage.sync.get({
            currency: 'us',
            delay: 200,
            owned_color: '#8ee22d',
            wishlist_color: '#4ecdef'
        }, function(items) {
            resolve(items);
        });
    });
}

function loadoptionsListener(request, sender, sendResponse) {
    if (request.operation === 'loadoptions') {
        loadOptions().then(function(items) {
            sendResponse({
                options: items
            });
        });
        return true;
    }
}

function launchoptionsListener(request, sender, sendResponse) {
    if (request.operation === 'launchoptions') {
        chrome.runtime.openOptionsPage(function() {
            sendResponse();
        });
        return true;
    }
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

function hasCategory(categoryId, categories) {
    var categoryFound = false;
    $.each(categories, function(idx, category) {
        if (category.id == categoryId) {
            categoryFound = true;
            return false;
        }
    });
    return categoryFound;
}

function steamApi(appid, cc) {
    var filters = 'basic,price_overview,platforms,genres,release_date,categories',
        appdetails = ajaxPromise('http://store.steampowered.com/api/appdetails/?filters=' + filters + '&appids=' + appid + '&cc=' + cc),
        appuserdetails = ajaxPromise('http://store.steampowered.com/api/appuserdetails/?appids=' + appid);
    return Promise.all([appdetails, appuserdetails]);
}

function ajaxPromise(url) {
    return new Promise(function(resolve, reject) {
        $.get(url).done(function(response) {
            resolve({
                success: true,
                data: response
            });
        }).fail(function(response) {
            resolve({
                success: false,
                status: response.status
            });
        });
    });
}

function appdetailsListener(request, sender, sendResponse) {
    if (request.operation === 'appdetails' && request.appid) {
        loadOptions().then(function(options) {
            var appid = request.appid,
                cc = options.currency,
                response = {},
                promise = steamApi(appid, cc);

            response.success = false;
            response.data = {};
            response.options = options;

            promise.then(function(values) {
                var appResponse = values[0],
                    userResponse = values[1];

                response.success = appResponse.success && appResponse.data[appid].success;
                if (response.success) {
                    var appdetails = appResponse.data[appid].data;
                    setHeaderImage(response, appdetails);
                    setTitle(response, appdetails);
                    setDescription(response, appdetails);
                    setPrice(response, appdetails, 'en-US');
                    setPlatforms(response, appdetails);
                    setGenre(response, appdetails);
                    setReleaseDate(response, appdetails);
                    setTradingCards(response, appdetails);
                    setOwnership(response, appdetails, appid, userResponse);

                    // Send response
                    sendResponse(response);
                }
            });
        });
        return true;
    }
}

/*
 * Build response functions
 */
function setHeaderImage(response, appdetails) {
    response.data.header_image = '<img src="' + appdetails.header_image + '"/>';
}

function setTitle(response, appdetails) {
    response.data.title = appdetails.name;
}

function setDescription(response, appdetails) {
    response.data.description = appdetails.about_the_game;
}

function setPrice(response, appdetails, locale) {
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
}

function setPlatforms(response, appdetails) {
    var platforms = appdetails.platforms;
    response.data.platform_win = platforms.windows;
    response.data.platform_mac = platforms.mac;
    response.data.platform_linux = platforms.linux;
}

function setGenre(response, appdetails) {
    if (appdetails.genres && appdetails.genres.length > 0) {
        response.data.genre = appdetails.genres[0].description;
    } else {
        response.data.genre = 'Uncategorized';
    }
}

function setReleaseDate(response, appdetails) {
    if (appdetails.release_date && appdetails.release_date.coming_soon === false) {
        response.data.release_date = appdetails.release_date.date;
    } else {
        response.data.release_date = 'Coming Soon';
    }
}

function setTradingCards(response, appdetails) {
    response.data.trading_cards = hasCategory(TRADING_CARDS_ID, appdetails.categories);
}

function setOwnership(response, appdetails, appid, userResponse) {
    response.data.user_signed_in = false;
    response.data.too_many_requests = false;
    if (userResponse.status && userResponse.status === 429) {
        response.data.too_many_requests = true;
    } else if (userResponse.success) {
        var appuserdetails = userResponse.data[appid].success && userResponse.data[appid].data;
        if (appuserdetails) {
            response.data.user_signed_in = true;
            response.data.is_owned = appuserdetails.is_owned;
            response.data.added_to_wishlist = appuserdetails.added_to_wishlist;
        }
    }
}


/*
 * Add listeners
 */
chrome.runtime.onMessage.addListener(templateListener);
chrome.runtime.onMessage.addListener(appdetailsListener);
chrome.runtime.onMessage.addListener(loadoptionsListener);
chrome.runtime.onMessage.addListener(launchoptionsListener);
