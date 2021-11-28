document.getElementById("submitApiKey").addEventListener("click",(function(){let e=document.getElementById("apiKey").value;chrome.storage.sync.set({apiKey:e},(function(){console.log("Set ApiKey")}))}));
//# sourceMappingURL=options.b8f76118.js.map
