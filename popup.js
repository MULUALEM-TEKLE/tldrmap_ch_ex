const { Transformer, builtInPlugins } = window.markmap
const { loadCSS, loadJS, Markmap, Toolbar } = window.markmap

const log = false

// Sample Markdown content for testing
const sampleMarkdown = `# My Chrome Extension
- **Purpose**
  - Summary of Web Pages
  - Visual Mind Map
- **Features**
  - Uses Google Gemini API for summarization
  - Renders Markdown as a mind map
- **Usage**
  - Click on extension icon
  - View summary in mind map format`

let apiKey_ = ""

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "updateMap") {
		showMappingToast()
		renderMindmap(request.data || sampleMarkdown)
			.then(() => {
				showMapGeneratedToast()
			})
			.catch((error) => {
				console.error("Error rendering mindmap:", error)
				showTryAgainToast()
			})
	} else if (request.action === "showSuccessToast") {
		showSuccessToast(request.message)
	} else if (request.action === "showErrorToast") {
		showErrorToast(request.message)
	} else if (request.action === "getApiKey") {
		chrome.storage.local.get(["apiKey"], function (result) {
			sendResponse({ apiKey: result.apiKey })
		})
		return true // Will respond asynchronously.
	} else if (request.action === "setApiKey") {
		chrome.storage.local.set({ apiKey: request.apiKey }, function () {
			sendResponse({ success: true })
		})
		return true // Will respond asynchronously.
	} else if (request.action === "clearApiKey") {
		chrome.storage.local.remove(["apiKey"], function () {
			sendResponse({ success: true })
		})
		return true // Will respond asynchronously.
	}
})

const options = {
	duration: 500,
	maxWidth: 400,
	initialExpandLevel: -2,
	zoom: true,
	pan: true,
	spacingHorizontal: 80,
	spacingVertical: 20,
	fitRatio: 0.9,
	maxInitialScale: 1.25,
	nodeMinHeight: 16,
	paddingX: 5,
	paddingY: 5,
}

/* const { markmap } = window;
const { Toolbar } = markmap; */

function renderMindmap(markdown) {
	return new Promise((resolve) => {
		if (log) console.log("rendering mindmap")
		const mindmapContainer = document.getElementById("mindmap")
		mindmapContainer.innerHTML = "" // Clear previous content

		// Create SVG element for markmap
		const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg")
		svgEl.setAttribute("id", "mindmapContainer")
		svgEl.setAttribute("style", "width: 750px; height: 500px;") // Adjust size as needed
		mindmapContainer.appendChild(svgEl)

		// Transform Markdown to Markmap data
		const transformer = new Transformer(builtInPlugins)
		const { root, features } = transformer.transform(markdown)
		const assets = transformer.getUsedAssets(features)

		if (log) console.log(Toolbar)

		// Create markmap
		let mm = Markmap.create(svgEl, options, root)

		const { el } = Toolbar.create(mm)

		setupToolbar(el, mindmapContainer)

		resolve()
	})
}

function enableButtons(apiKey) {
	const generateButton = document.getElementById("generateButton")
	const downloadButton = document.getElementById("downloadButton")
	const clearApiKeyButton = document.getElementById("clearApiKey")
	const saveApiKeyButton = document.getElementById("saveApiKey")
	const cancelApiKeyButton = document.getElementById("cancelApiKey")

	if (apiKey) {
		generateButton.disabled = false
		downloadButton.disabled = false
		clearApiKeyButton.disabled = false
		generateButton.style.backgroundColor = "white"
		downloadButton.style.backgroundColor = "white"
		clearApiKeyButton.style.backgroundColor = "white"
		generateButton.style.color = "black"
		downloadButton.style.color = "black"
		clearApiKeyButton.style.color = "black"
		saveApiKeyButton.disabled = false
		saveApiKeyButton.style.backgroundColor = "white"
		saveApiKeyButton.style.color = "black"
		cancelApiKeyButton.disabled = false
		cancelApiKeyButton.style.backgroundColor = "white"
		cancelApiKeyButton.style.color = "black"
	} else {
		generateButton.disabled = true
		downloadButton.disabled = true
		clearApiKeyButton.disabled = true
		generateButton.style.backgroundColor = "lightgrey"
		downloadButton.style.backgroundColor = "lightgrey"
		clearApiKeyButton.style.backgroundColor = "lightgrey"
		generateButton.style.color = "grey"
		downloadButton.style.color = "grey"
		clearApiKeyButton.style.color = "grey"
		saveApiKeyButton.disabled = false
		saveApiKeyButton.style.backgroundColor = "white"
		saveApiKeyButton.style.color = "black"
		cancelApiKeyButton.disabled = true
		cancelApiKeyButton.style.backgroundColor = "lightgrey"
		cancelApiKeyButton.style.color = "grey"
	}
}

// Request summary if available immediately on popup open
document.addEventListener("DOMContentLoaded", () => {
	chrome.storage.local.get(["apiKey"], function (result) {
		apiKey_ = result.apiKey
		if (log) console.log("API Key loaded from local storage:", apiKey_)
		updateApiKeyStatus(apiKey_)
		enableButtons(apiKey_)

		if (apiKey_ !== undefined && apiKey_ !== "") {
			// If API key is already present, do not show the settings dialog
			renderMindmap(sampleMarkdown)
				.then(() => {
					// hideLoading()
					if (log) console.log("apiKey_:", apiKey_)
				})
				.catch((error) => {
					console.error("Error rendering sample mindmap:", error)
					// hideLoading() // Hide loading if there's an error
				}) // Use sample if no summary available
		} else {
			openApiKeyDialog()
		}
	})

	document
		.getElementById("apiKeyInputDialog")
		.addEventListener("change", () => {
			const apiKey = document.getElementById("apiKeyInputDialog").value
			chrome.runtime.sendMessage(
				{ action: "setApiKey", apiKey: apiKey },
				(response) => {
					if (response.success) {
						showSuccessToast("API Key updated successfully!")
						updateApiKeyStatus(apiKey)
						enableButtons(apiKey)
					} else {
						showErrorToast("Failed to update API Key.")
					}
				}
			)
		})
	const settingsButton = document.getElementById("settingsButton")
	if (settingsButton) {
		settingsButton.addEventListener("click", openApiKeyDialog)
	} else {
		console.error("settingsButton not found!")
	}
	let isDarkMode = false
	document.getElementById("modeButton").addEventListener("click", () => {
		isDarkMode = !isDarkMode
		document.body.classList.toggle("dark-mode", isDarkMode)
		document.getElementById("modeButton").textContent = isDarkMode
			? "Light Mode"
			: "Dark Mode"
	})

	document
		.getElementById("generateButton")
		.addEventListener("click", function () {
			showMappingToast()
			chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
				chrome.scripting.executeScript(
					{
						target: { tabId: tabs[0].id },
						func: () => {
							return document.body.innerText
						},
					},
					(results) => {
						if (chrome.runtime.lastError) {
							console.error(chrome.runtime.lastError)
							return
						}
						// showLoading()
						chrome.runtime.sendMessage({
							action: "getText",
							data: results[0].result,
						})
					}
				)
			})
		})

	document
		.getElementById("downloadButton")
		.addEventListener("click", async function () {
			const mindmap = document.getElementById("mindmapContainer") // Ensure this matches your SVG element's ID
			const backgroundColor = isDarkMode ? "black" : "white"
			const textColor = isDarkMode ? "white" : "black"
			try {
				const title = document.title // Get the page title
				const dataUrl = await htmlToImage.toPng(mindmap, {
					backgroundColor: backgroundColor,
					width: mindmap.clientWidth,
					height: mindmap.clientHeight,
					pixelRatio: 5,
					style: {
						background: backgroundColor,
						color: textColor,
					},
				})

				// Create an anchor element to trigger the download
				const link = document.createElement("a")
				link.download = `${title}.png` // Rename using page title
				link.href = dataUrl
				// Append to the body, click it, then remove it
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
				showImageDownloadedToast()
			} catch (error) {
				console.error("Error while creating screenshot:", error)
				alert(
					"An error occurred while downloading the mindmap. Please try again."
				)
			}
		})
	document.getElementById("saveApiKey").addEventListener("click", () => {
		const apiKey = document.getElementById("apiKeyInputDialog").value.trim()
		if (!apiKey) {
			showErrorToast("Please enter an API key!")
			return
		}
		chrome.storage.local.set({ apiKey: apiKey }, function () {
			showSuccessToast("API Key updated successfully!")
			updateApiKeyStatus(apiKey)
			apiKey_ = apiKey // Update apiKey_ here
			closeApiKeyDialog()
		})
	})
	document.getElementById("clearApiKey").addEventListener("click", () => {
		chrome.storage.local.remove(["apiKey"], function () {
			showSuccessToast("API Key cleared successfully!")
			updateApiKeyStatus("")
			document.getElementById("apiKeyInputDialog").value = ""
			apiKey_ = undefined
			closeApiKeyDialog()
			enableButtons(null)
		})
	})
	document
		.getElementById("cancelApiKey")
		.addEventListener("click", closeApiKeyDialog)
})

// Helper function to style and append the toolbar
function setupToolbar(el, container) {
	el.id = "toolbar"

	// Apply styles
	const styles = {
		position: "absolute",
		bottom: "0.5rem",
		right: "0.5rem",
		display: "flex",
		flexDirection: "row",
		backgroundColor: "white",
		color: "black",
		padding: "0.5rem",
		borderRadius: "0.5rem",
		boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
		alignItems: "center",
		gap: "0.5rem",
	}

	Object.assign(el.style, styles)

	container.append(el)

	if (log) console.log("added toolbar")
}

function showMappingToast() {
	showCustomToast("Started to generate map", "#777700")
}

function showMapGeneratedToast() {
	showCustomToast("Map Generated", "#00dd00")
}

function showImageDownloadedToast() {
	showCustomToast("Image Downloaded", "#00dd00")
}

function showTryAgainToast() {
	showCustomToast("Try again", "#dd0000")
}

function showCustomToast(message, backgroundColor) {
	const toast = document.getElementById("toast")
	toast.textContent = message
	toast.style.backgroundColor = backgroundColor
	toast.style.display = "block"
	setTimeout(() => {
		toast.style.display = "none"
	}, 3000)
}

function openApiKeyDialog() {
	document.getElementById("apiKeyDialog").style.display = "block"
	document.getElementById("apiKeyInputDialog").focus()
	if (log) console.log("api key is " + apiKey_)
	enableButtons(apiKey_)
}

function closeApiKeyDialog() {
	document.getElementById("apiKeyDialog").style.display = "none"
	if (log) console.log("api key is " + apiKey_)
	enableButtons(apiKey_)
}

function showSuccessToast(message) {
	const toast = document.getElementById("toast")
	toast.textContent = message
	toast.style.backgroundColor = "#4CAF50"
	toast.style.display = "block"
	setTimeout(() => {
		toast.style.display = "none"
	}, 3000)
}

function showErrorToast(message) {
	const toast = document.getElementById("toast")
	toast.textContent = message
	toast.style.backgroundColor = "#f44336"
	toast.style.display = "block"
	setTimeout(() => {
		toast.style.display = "none"
	}, 3000)
}

function updateApiKeyStatus(apiKey) {
	const apiKeyStatus = document.getElementById("apiKeyStatus")
	if (apiKey && apiKey !== "") {
		apiKeyStatus.textContent = "API Key set."
	} else {
		apiKeyStatus.textContent = "API Key needed."
	}
}
