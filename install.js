function installListener() {
    var webstoreURL = "https://chrome.google.com/webstore/detail/jfakmahmklpeigafdahkgkmnlmfjaphd",
        install = function() {
            window.location.href = webstoreURL;
        };

    function onSuccess() {
        document.getElementById('install-button').disabled = true;
        document.getElementById('install-button-text').innerHTML = 'Installed';
    }

    function onFailure(errorString) {
        console.error(errorString);
    }

    if (typeof chrome !== 'undefined' && bowser.chrome) {
        install = function() {
            chrome.webstore.install(webstoreURL, onSuccess, onFailure);
        };
    }

    document.getElementById('install-button').addEventListener('click', install);
}

installListener();
