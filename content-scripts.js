document.addEventListener("DOMContentLoaded", function () {
	console.log("Sending message from content script")
	chrome.runtime.sendMessage({
		action: "getText",
		data: document.body.innerText,
	})
})
