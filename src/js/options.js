function onCurrencyChange() {
    chrome.storage.sync.set({
        currency: this.value
    });
}

function restoreOptions() {
    chrome.storage.sync.get({
        currency: 'us'
    }, function(items) {
        document.getElementById('currency').value = items.currency;
        document.getElementById('options').setAttribute('style', "display: block;");
    });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('currency').addEventListener('change', onCurrencyChange);
