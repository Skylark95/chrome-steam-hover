function onCurrencyChange() {
    chrome.storage.sync.set({
        currency: this.value
    });
}

function onOwnedColorChange() {
    chrome.storage.sync.set({
        owned_color: this.value
    });
}

function onOwnedColorDefault() {
    var el = document.getElementById('owned_color');
    el.value = '#8ee22d';
    onOwnedColorChange.call(el);
}

function onWishlistColorChange() {
    chrome.storage.sync.set({
        wishlist_color: this.value
    });
}

function onWishlistColorDefault() {
    var el = document.getElementById('wishlist_color');
    el.value = '#4ecdef';
    onWishlistColorChange.call(el);
}

function restoreOptions() {
    chrome.storage.sync.get({
        currency: 'us',
        owned_color: '#8ee22d',
        wishlist_color: '#4ecdef'
    }, function(items) {
        document.getElementById('currency').value = items.currency;
        document.getElementById('owned_color').value = items.owned_color;
        document.getElementById('wishlist_color').value = items.wishlist_color;
        document.getElementById('options').setAttribute('style', "display: block;");
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('currency').addEventListener('change', onCurrencyChange);
document.getElementById('owned_color').addEventListener('change', onOwnedColorChange);
document.getElementById('wishlist_color').addEventListener('change', onWishlistColorChange);
document.getElementById('owned_color_default').addEventListener('click', onOwnedColorDefault);
document.getElementById('wishlist_color_default').addEventListener('click', onWishlistColorDefault);
