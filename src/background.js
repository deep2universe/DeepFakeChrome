/**
 * After installation, show option page to enter ApiKey
 */
chrome.runtime.onInstalled.addListener(function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('options.html'));
    }
});

/**
 * Check if user switch to https://www.youtube.com/watch* url and init video record button
 */
chrome.webNavigation.onHistoryStateUpdated.addListener(function (details){
    if(details.url.includes("https://www.youtube.com/watch")){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, {message: "initRecordButton"});
        });
    }
});
