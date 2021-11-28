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
