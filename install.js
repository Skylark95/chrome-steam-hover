function installListener() {
    var webstoreURL = "https://chrome.google.com/webstore/detail/jfakmahmklpeigafdahkgkmnlmfjaphd";

    function hideInstall() {
        button.style.display = 'none';
    }

    function goToWebstore() {
        window.location.href = webstoreURL;
    }

    function installFailed(errorString) {
        console.error(errorString);
        goToWebstore();
    }

    var button = document.getElementById('install-button'),
        install = goToWebstore;
    if (typeof chrome !== 'undefined') {
        install = function() {
            chrome.webstore.install(webstoreURL, hideInstall, installFailed);
        };
        if (chrome.app.isInstalled) {
            hideInstall();
        }
    }
    
    button.addEventListener('click', install);
}

installListener();
