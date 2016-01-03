function formatPrice(price, locale, currency) {
    var num = price / 100;
    return num.toLocaleString(locale, { style: 'currency', currency: currency });
}
function showIfTrue(selector, visibility) {
    if (visibility) {
        $(selector).show();
    }
}
$.get('appdetails.json').done(function(data) {
    if (data) {
        var appid = '730',
            appdetails = data[appid].data,
            locale = 'en-US',
            price = appdetails.price_overview,
            currency = price.currency,
            platforms = appdetails.platforms;

        $('.sh_header_image').html('<img src="' + appdetails.header_image + '"/>');
        $('.sh_title').html(appdetails.name);
        $('.sh_description').html(appdetails.detailed_description);
        $('.sh_price_discount').html('(' + price.discount_percent + '%)');
        $('.sh_price_initial').html(formatPrice(price.initial, locale, currency));
        $('.sh_price_final').html(formatPrice(price.final, locale, currency));

        showIfTrue('.sh_platform_win', platforms.windows);
        showIfTrue('.sh_platform_mac', platforms.mac);
        showIfTrue('.sh_platform_linux', platforms.linux);

        $('.sh_store_page').attr('href', 'http://store.steampowered.com/app/' + appid);
        $('.sh_steam_db').attr('href', 'https://steamdb.info/app/' + appid);
    }
});
