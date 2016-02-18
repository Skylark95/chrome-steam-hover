function enableOptionsButton() {
    var div = document.getElementById('options-button'),
        button = document.getElementById('open-options');

    // Remove hidden class
    if (div) {
        div.classList.remove("hidden");
    }

    // Add on click listener to open options
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
}

function disableAddToChrome() {
    var installButton = document.getElementById('install-button'),
        installText = document.getElementById('install-button-text');

    if (installButton && installText) {
        installButton.disabled = true;
        installText.innerHTML = 'Installed';
    }
}

enableOptionsButton();
disableAddToChrome();
