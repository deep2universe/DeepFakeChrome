import * as deepfake from './deepfake';

let apiKey;

/**
 * Read the api key from storage. If it is not set, it will try to get it from the user.
 */
function readApiKey() {
    chrome.storage.sync.get(['apiKey'], function (result) {
        apiKey = result.apiKey;
        // Check if ApiKey is provided. Otherwise let user provide it.
        if (apiKey === undefined) {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        } else {
            deepfake.init(apiKey);
        }

    });
}

/**
 * Get Message from background.js if url change to https://www.youtube.com/watch*
 * Then read the apiKey and init video player button if not exist
 * YouTube doesn't reload the page when you go from one video to another or from the main page
 * therefore we need this hack and use onHistoryStateUpdated in the service worker
 */
chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
       if(request.message === "initRecordButton"){
           readApiKey();
       }
    }
);
