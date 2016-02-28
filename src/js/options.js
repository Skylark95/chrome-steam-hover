function onCurrencyChange() {
    chrome.storage.sync.set({
        currency: this.value
    });
}

function onDelayChange() {
    chrome.storage.sync.set({
        delay: Math.round(this.value)
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        currency: 'us',
        delay: 200
    }, function(items) {
        document.getElementById('currency').value = items.currency;
        document.getElementById('delay').value = items.delay;
        document.getElementById('options').setAttribute('style', "display: block;");
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('currency').addEventListener('change', onCurrencyChange);
document.getElementById('delay').addEventListener('change', onDelayChange);
