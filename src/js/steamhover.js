function formatPrice(price, locale, currency) {
    var num = price / 100;
    return num.toLocaleString(locale, { style: 'currency', currency: currency });
}

function showIfTrue(selector, visibility) {
    if (visibility) {
        $(selector).show();
    }
}

function getURLParam (oTarget, sVar) {
    return decodeURI(oTarget.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURI(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function displayAppDetails(appid) {
    $.get('/api/appdetails/?appids=' + appid).done(function(data) {
        if (data) {
            var appdetails = data[appid].data,
                locale = 'en-US',
                platforms = appdetails.platforms;

            // header
            $('.sh_header_image').html('<img src="' + appdetails.header_image + '"/>');

            // title
            $('.sh_title').html(appdetails.name);

            // description
            var description = $('.sh_description');
            description.html(appdetails.about_the_game);
            description.find(':header, img, ul, br, strong').remove();
            var parts = description.text().split(' ');
            if (parts.length > 200) {
                parts = parts.slice(0, 200);
                parts.push('...');
            }
            description.html(parts.join(' '));

            // price
            if (appdetails.is_free) {
                $('.sh_price_final').html('FREE');
            } else {
                var price = appdetails.price_overview,
                    currency = price.currency;
                $('.sh_price_final').html(formatPrice(price.final, locale, currency));
                if (price.discount_percent && price.discount_percent > 0) {
                    $('.sh_price_discount').html('(' + price.discount_percent + '%)');
                    $('.sh_price_initial').html(formatPrice(price.initial, locale, currency));
                }
            }

            // platforms
            showIfTrue('.sh_platform_win', platforms.windows);
            showIfTrue('.sh_platform_mac', platforms.mac);
            showIfTrue('.sh_platform_linux', platforms.linux);

            // genre
            if (appdetails.genres && appdetails.genres.length > 0) {
                $('.sh_genre').html(appdetails.genres[0].description);
            } else {
                $('.sh_genre').html('Uncategorized');
            }

            // release date
            if (appdetails.release_date && appdetails.release_date.coming_soon === false) {
                $('.sh_release_date').html(appdetails.release_date.date);
            } else {
                $('.sh_release_date').html('Coming Soon');
            }
        }
    });
}

displayAppDetails(getURLParam(window.location, 'appid'));
