function isApiKeyValid(e){return/[a-zA-Z0-9]{20}.[a-zA-Z0-9]{20}/.test(e)}document.getElementById("submitApiKey").addEventListener("click",(function(){let e=document.getElementById("apiKey").value,t=document.getElementById("invalidKey");isApiKeyValid(e)?(t.style.display="none",chrome.storage.sync.set({apiKey:e},(function(){}))):t.style.display="block"}));
//# sourceMappingURL=options.fe5c49ea.js.map