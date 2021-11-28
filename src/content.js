import * as deepfake from './deepfacke';

window.addEventListener("load", function(event) {
    let apiKey;
    chrome.storage.sync.get(['apiKey'], function(result) {
        apiKey = result.apiKey;
        // Check if ApiKey is provided. Otherwise let user provide it.
        if(apiKey === undefined){
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage();
            } else {
                window.open(chrome.runtime.getURL('options.html'));
            }
        }else {
            deepfake.init(apiKey);
        }

    });
});
