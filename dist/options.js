document.getElementById("submitApiKey").addEventListener("click",(function(){let e=document.getElementById("apiKey").value,t=document.getElementById("invalidKey");!function(e){return/[a-zA-Z0-9]{20}.[a-zA-Z0-9]{20}/.test(e)}(e)?t.style.display="block":(t.style.display="none",chrome.storage.sync.set({apiKey:e},(function(){console.log("Set ApiKey")})))}));
//# sourceMappingURL=options.js.map
