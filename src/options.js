/**
 * Save apiKey in storage
 */
document.getElementById("submitApiKey").addEventListener("click", function (){
    let value = document.getElementById("apiKey").value;
    let errorMessage = document.getElementById('invalidKey');
    if(isApiKeyValid(value)){
        errorMessage.style.display='none';
        chrome.storage.sync.set({apiKey: value}, function() {
        });
    }else {
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

