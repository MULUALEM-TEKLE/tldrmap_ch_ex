chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getText") {
		const pageText = document.body.innerText
		chrome.runtime.sendMessage({ action: "pageText", data: pageText })
	}
})
