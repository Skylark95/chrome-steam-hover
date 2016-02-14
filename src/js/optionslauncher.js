var div = document.getElementById('options-button'),
    button = document.getElementById('open-options');

if (div) {
    div.className = "";
}

if (button) {
    button.addEventListener("click", function() {
        chrome.runtime.sendMessage({operation: 'launchoptions'}, function() {
            var reloadAlert = document.getElementById('reload-alert');
            if (reloadAlert) {
                reloadAlert.classList.remove('hidden');
            }
        });
    });
}
