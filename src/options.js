

document.getElementById("submitApiKey").addEventListener("click", function (){
    let value = document.getElementById("apiKey").value;
    chrome.storage.sync.set({apiKey: value}, function() {
        console.log("Set ApiKey");
    });
});

