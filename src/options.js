/**
 * Save apiKey in storage
 */
document.getElementById("submitApiKey").addEventListener("click", function (){
    let value = document.getElementById("apiKey").value;
    let errorMessage = document.getElementById('invalidKey');
    let validMessage = document.getElementById('validKey');
    if(isApiKeyValid(value)){
        errorMessage.style.display='none';
        validMessage.style.display='block';
        chrome.storage.sync.set({apiKey: value}, function() {
        });
    }else {
        validMessage.style.display='none';
        errorMessage.style.display='block';
    }

});

/**
 * Check ApiKey format
 * Modzy api key structure is:  20 characters - period - 20 characters
 * characters are random numbers and letters, both lowercase and uppercase are allowed
 *
 * @param value
 * @returns {boolean}
 */
function isApiKeyValid(value){
    // [a-zA-Z0-9]{20}.[a-zA-Z0-9]{20}
    const regEx = /[a-zA-Z0-9]{20}.[a-zA-Z0-9]{20}/;
    return regEx.test(value);
}

/**
 * If ApiKey exists, display it
 */
function displayApiKey() {
    chrome.storage.sync.get(['apiKey'], function (result) {
        if (result.apiKey !== undefined) {
            document.getElementById("apiKey").value=result.apiKey;
        }

    });
}

displayApiKey();
