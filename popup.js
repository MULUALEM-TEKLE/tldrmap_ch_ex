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

let defaultPrompt_ = ""
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	const handlers = {
		updateMap: handleUpdateMap,
		showSuccessToast: handleShowSuccessToast,
		showErrorToast: handleShowErrorToast,
		hideLoadingOverlay: handleHideLoadingOverlay,
		getApiKey: handleGetApiKey,
		setApiKey: handleSetApiKey,
		clearApiKey: handleClearApiKey,
		getDefaultPrompt: handleGetDefaultPrompt,
		setDefaultPrompt: handleSetDefaultPrompt,
	}

	const handler = handlers[request.action]
	if (handler) {
		handler(request, sender, sendResponse)
	} else {
		console.error(`Unknown action: ${request.action}`)
	}
})

function handleUpdateMap(request, sender, sendResponse) {
	showMappingToast()
	renderMindmap(request.data || sampleMarkdown)
		.then(() => {
			showMapGeneratedToast()
		})
		.catch((error) => {
			console.error("Error rendering mindmap:", error)
			showTryAgainToast()
		})
}

function handleShowSuccessToast(request, sender, sendResponse) {
	showSuccessToast(request.message)
}

function handleShowErrorToast(request, sender, sendResponse) {
	showErrorToast(request.message)
}

function handleHideLoadingOverlay(request, sender, sendResponse) {
	hideLoadingOverlay()
}

/**
 * Handles API key related storage operations.
 * @param {string} operation - The operation to perform ('get', 'set', or 'clear')
 * @param {string} [value] - The value to set (only for 'set' operation)
 * @returns {Promise<any>} A promise that resolves with the operation result
 */
function handleApiKeyStorage(operation, value = null) {
	return new Promise((resolve, reject) => {
		try {
			switch (operation) {
				case "get":
					chrome.storage.local.get(["apiKey"], (result) => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError)
						} else {
							resolve(result.apiKey)
						}
					})
					break
				case "set":
					if (!value) {
						reject(new Error("Value is required for set operation"))
						return
					}
					chrome.storage.local.set({ apiKey: value }, () => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError)
						} else {
							resolve(true)
						}
					})
					break
				case "clear":
					chrome.storage.local.remove(["apiKey"], () => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError)
						} else {
							resolve(true)
						}
					})
					break
				default:
					reject(new Error("Invalid operation"))
			}
		} catch (error) {
			reject(error)
		}
	})
}

function handleGetApiKey(request, sender, sendResponse) {
	handleApiKeyStorage("get")
		.then((apiKey) => sendResponse({ apiKey }))
		.catch((error) => {
			console.error("Error getting API key:", error)
			sendResponse({ error: error.message })
		})
	return true
}

function handleSetApiKey(request, sender, sendResponse) {
	handleApiKeyStorage("set", request.apiKey)
		.then(() => sendResponse({ success: true }))
		.catch((error) => {
			console.error("Error setting API key:", error)
			sendResponse({ error: error.message })
		})
	return true
}

function handleClearApiKey(request, sender, sendResponse) {
	handleApiKeyStorage("clear")
		.then(() => sendResponse({ success: true }))
		.catch((error) => {
			console.error("Error clearing API key:", error)
			sendResponse({ error: error.message })
		})
	return true
}

/**
 * Handles default prompt related storage operations.
 * @param {string} operation - The operation to perform ('get' or 'set')
 * @param {string} [value] - The value to set (only for 'set' operation)
 * @returns {Promise<any>} A promise that resolves with the operation result
 */
function handleDefaultPromptStorage(operation, value = null) {
	return new Promise((resolve, reject) => {
		try {
			switch (operation) {
				case "get":
					chrome.storage.local.get(["defaultPrompt"], (result) => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError)
						} else {
							resolve(result.defaultPrompt || getDefaultPrompt())
						}
					})
					break
				case "set":
					if (!value) {
						reject(new Error("Value is required for set operation"))
						return
					}
					chrome.storage.local.set({ defaultPrompt: value }, () => {
						if (chrome.runtime.lastError) {
							reject(chrome.runtime.lastError)
						} else {
							resolve(true)
						}
					})
					break
				default:
					reject(new Error("Invalid operation"))
			}
		} catch (error) {
			reject(error)
		}
	})
}

function handleGetDefaultPrompt(request, sender, sendResponse) {
	handleDefaultPromptStorage("get")
		.then((defaultPrompt) => sendResponse({ defaultPrompt }))
		.catch((error) => {
			console.error("Error getting default prompt:", error)
			sendResponse({ error: error.message })
		})
	return true
}

function handleSetDefaultPrompt(request, sender, sendResponse) {
	handleDefaultPromptStorage("set", request.defaultPrompt)
		.then(() => sendResponse({ success: true }))
		.catch((error) => {
			console.error("Error setting default prompt:", error)
			sendResponse({ error: error.message })
		})
	return true
}

const options = {
	duration: 500,
	maxWidth: 400,
	initialExpandLevel: -2,
	zoom: true,
	pan: true,
	spacingHorizontal: 80,
	spacingVertical: 20,
	fitRatio: 0.8,
	maxInitialScale: 1.125,
	nodeMinHeight: 16,
	paddingX: 5,
	paddingY: 5,
	color: (node) => {
		// For the fill of a folded (collapsed) node's circle
		if (node.payload?.fold && node.children?.length) {
			return "var(--markmap-circle-closed-bg)"
		}
		// For the stroke of connector lines and circle borders
		// Note: The fill of an open circle is handled by --markmap-circle-open-bg in CSS
		return "var(--markmap-line-color)"
	},
}

/* const { markmap } = window;
const { Toolbar } = markmap; */

/**
 * Renders a mindmap from the given Markdown content.
 * @param {string} markdown - The Markdown content to render.
 * @returns {Promise<void>} - A promise that resolves when the mindmap is rendered.
 */
function renderMindmap(markdown) {
	return new Promise((resolve, reject) => {
		try {
			if (log) console.log("rendering mindmap")
			const mindmapContainer = document.getElementById("mindmap")
			if (!mindmapContainer) {
				throw new Error("Mindmap container not found")
			}
			mindmapContainer.innerHTML = "" // Clear previous content

			// Create SVG element for markmap
			const svgEl = document.createElementNS(
				"http://www.w3.org/2000/svg",
				"svg"
			)
			svgEl.setAttribute("id", "mindmapContainer")
			svgEl.setAttribute("style", "width: 750px; height: 400px;") // Adjust size as needed
			mindmapContainer.appendChild(svgEl)

			// Transform Markdown to Markmap data first
			const transformer = new Transformer(builtInPlugins)
			const { root, features } = transformer.transform(markdown)

			// Decode HTML entities in the transformed data
			// The markmap library re-encodes some entities, so we need to decode them after transformation
			function decodeEntitiesInNode(node) {
				if (node.content) {
					node.content = node.content
						.replace(/&amp;/g, "&")
						.replace(/&lt;/g, "<")
						.replace(/&gt;/g, ">")
						.replace(/&quot;/g, '"')
						.replace(/&#39;/g, "'")
						.replace(/&apos;/g, "'")
						.replace(/&#x2F;/g, "/")
						.replace(/&#x60;/g, "`")
						.replace(/&#x3D;/g, "=")
				}
				if (node.children) {
					node.children.forEach(decodeEntitiesInNode)
				}
			}

			decodeEntitiesInNode(root)
			const assets = transformer.getUsedAssets(features)

			if (log) console.log(Toolbar)

			// Create markmap
			let mm = Markmap.create(svgEl, options, root)

			const { el } = Toolbar.create(mm)

			setupToolbar(el, mindmapContainer)

			resolve()
		} catch (error) {
			console.error("Error rendering mindmap:", error)
			reject(error)
		}
	})
}

/**
 * Enables or disables buttons based on the presence of an API key.
 * @param {string} apiKey - The API key to check.
 */
function enableButtons(apiKey) {
	const buttons = {
		generateButton: document.getElementById("generateButton"),
		downloadButton: document.getElementById("downloadButton"),
		clearApiKeyButton: document.getElementById("clearApiKey"),
		saveApiKeyButton: document.getElementById("saveApiKey"),
		cancelApiKeyButton: document.getElementById("cancelApiKey"),
	}

	const enableButton = (button, enabled) => {
		button.disabled = !enabled
	}

	if (apiKey) {
		enableButton(buttons.generateButton, true)
		enableButton(buttons.downloadButton, true)
		enableButton(buttons.clearApiKeyButton, true)
		enableButton(buttons.saveApiKeyButton, true)
		enableButton(buttons.cancelApiKeyButton, true)
	} else {
		enableButton(buttons.generateButton, false)
		enableButton(buttons.downloadButton, false)
		enableButton(buttons.clearApiKeyButton, false)
		enableButton(buttons.saveApiKeyButton, true)
		enableButton(buttons.cancelApiKeyButton, false)
	}
}

// Request summary if available immediately on popup open
document.addEventListener("DOMContentLoaded", () => {
	initializeApp()
})

/**
 * Initializes the application by setting up event listeners and loading initial data.
 */
function initializeApp() {
	// Load theme preference from local storage
	chrome.storage.local.get(["isDarkMode"], (result) => {
		const isDarkMode =
			result.isDarkMode === undefined ? false : result.isDarkMode // Default to light mode if not set
		document.body.classList.toggle("dark-mode", isDarkMode)
		document.getElementById("modeButton").innerHTML = isDarkMode
			? '<img src="icons/sun.svg" alt="Light Mode">'
			: '<img src="icons/moon-star.svg" alt="Dark Mode">'
		updateTheme()
	})

	loadInitialData()
	setupEventListeners()
}

/**
 * Loads initial data from local storage and sets up the UI.
 */
function loadInitialData() {
	chrome.storage.local.get(["apiKey", "defaultPrompt"], function (result) {
		apiKey_ = result.apiKey
		defaultPrompt_ = result.defaultPrompt || getDefaultPrompt()
		if (log) console.log("API Key loaded from local storage:", apiKey_)
		if (log)
			console.log("Default Prompt loaded from local storage:", defaultPrompt_)
		updateApiKeyStatus(apiKey_)
		updateDefaultPromptStatus(defaultPrompt_)
		enableButtons(apiKey_)
		document.getElementById("defaultPromptInputDialog").value =
			defaultPrompt_ || getDefaultPrompt()

		if (apiKey_ !== undefined && apiKey_ !== "") {
			document.getElementById("apiKeyInputDialog").value = apiKey_

			renderMindmap(sampleMarkdown)
				.then(() => {
					if (log) console.log("apiKey_:", apiKey_)
				})
				.catch((error) => {
					console.error("Error rendering sample mindmap:", error)
				})
		} else {
			openApiKeyDialog()
		}
	})
}

/**
 * Sets up event listeners for various UI elements.
 */
function setupEventListeners() {
	document
		.getElementById("apiKeyInputDialog")
		.addEventListener("change", handleApiKeyChange)
	document
		.getElementById("defaultPromptInputDialog")
		.addEventListener("change", handleDefaultPromptChange)
	document
		.getElementById("settingsButton")
		.addEventListener("click", openApiKeyDialog)
	document
		.getElementById("modeButton")
		.addEventListener("click", toggleDarkMode)
	document
		.getElementById("generateButton")
		.addEventListener("click", handleGenerateButtonClick)
	document
		.getElementById("downloadButton")
		.addEventListener("click", handleDownloadButtonClick)
	document
		.getElementById("saveApiKey")
		.addEventListener("click", handleSaveApiKey)
	document
		.getElementById("clearApiKey")
		.addEventListener("click", handleClearApiKey)
	document
		.getElementById("cancelApiKey")
		.addEventListener("click", closeApiKeyDialog)
	document
		.getElementById("saveDefaultPrompt")
		.addEventListener("click", handleSaveDefaultPrompt)
	document.addEventListener("DOMContentLoaded", updateTheme)
	document.getElementById("modeButton").addEventListener("click", updateTheme)
}

/**
 * Handles changes to the API key input.
 */
function handleApiKeyChange() {
	const apiKey = document.getElementById("apiKeyInputDialog").value
	chrome.runtime.sendMessage(
		{ action: "setApiKey", apiKey: apiKey },
		(response) => {
			if (response && response.success) {
				showSuccessToast("API Key updated successfully!")
				updateApiKeyStatus(apiKey)
				enableButtons(apiKey)
			} else {
				showErrorToast("Failed to update API Key.")
			}
		}
	)
}

/**
 * Handles changes to the default prompt input.
 */
function handleDefaultPromptChange() {
	const defaultPrompt = document.getElementById(
		"defaultPromptInputDialog"
	).value
	chrome.runtime.sendMessage(
		{ action: "setDefaultPrompt", defaultPrompt: defaultPrompt },
		(response) => {
			if (response.success) {
				showSuccessToast("Default Prompt updated successfully!")
				updateDefaultPromptStatus(defaultPrompt)
			} else {
				showErrorToast("Failed to update Default Prompt.")
			}
		}
	)
}

/**
 * Toggles dark mode.
 */
function toggleDarkMode() {
	let isDarkMode = !document.body.classList.contains("dark-mode")
	document.body.classList.toggle("dark-mode", isDarkMode)
	document.getElementById("modeButton").innerHTML = isDarkMode
		? '<img src="icons/sun.svg" alt="Light Mode">'
		: '<img src="icons/moon-star.svg" alt="Dark Mode">'

	// Save theme preference to local storage
	chrome.storage.local.set({ isDarkMode: isDarkMode }, () => {
		if (chrome.runtime.lastError) {
			console.error("Error saving theme preference:", chrome.runtime.lastError)
		} else {
			if (log) console.log("Theme preference saved:", isDarkMode)
		}
	})

	updateTheme()
}

/**
 * Handles the generate button click event.
 */
function handleGenerateButtonClick() {
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
				chrome.runtime.sendMessage({
					action: "getText",
					data: results[0].result,
				})
			}
		)
	})
}

/**
 * Handles the download button click event.
 */
function showImageDownloadedToast() {
	showCustomToast(
		"Image Downloaded and Copied to Clipboard with Promotional Text",
		"#00dd00"
	)
}

async function handleDownloadButtonClick() {
	const mindmap = document.getElementById("mindmapContainer")
	const backgroundColor = document.body.classList.contains("dark-mode")
		? "black"
		: "white"
	const textColor = document.body.classList.contains("dark-mode")
		? "white"
		: "black"
	try {
		const title = document.title
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

		// Copy to clipboard with both image and text
		try {
			const response = await fetch(dataUrl)
			const blob = await response.blob()
			const promotionalText =
				// "create free mind-maps at : https://tldrmap.vercel.app/ \nsupport the project at : https://ko-fi.com/xarbuildthings"
				// "https://x.com/XAFODIAN/status/1954890992953544947"
				"mindmapping tool => pinned post "

			await navigator.clipboard.write([
				new ClipboardItem({
					[blob.type]: blob,
					"text/plain": new Blob([promotionalText], { type: "text/plain" }),
				}),
			])
		} catch (clipboardError) {
			console.error("Error copying to clipboard:", clipboardError)
			showCustomToast("Image Downloaded (Clipboard Copy Failed)", "#dd7700")
			return
		}

		// Download image
		const link = document.createElement("a")
		link.download = `${title}.png`
		link.href = dataUrl
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		showImageDownloadedToast()
	} catch (error) {
		console.error("Error while creating screenshot:", error)
		alert("An error occurred while downloading the mindmap. Please try again.")
	}
}

/**
 * Handles saving the API key.
 */
function handleSaveApiKey() {
	const apiKey = document.getElementById("apiKeyInputDialog").value.trim()
	if (!apiKey) {
		showErrorToast("Please enter an API key!")
		return
	}
	chrome.storage.local.set({ apiKey: apiKey }, function () {
		showSuccessToast("API Key updated successfully!")
		updateApiKeyStatus(apiKey)
		apiKey_ = apiKey
		closeApiKeyDialog()
		renderMindmap(sampleMarkdown)
			.then(() => {
				showMapGeneratedToast()
			})
			.catch((error) => {
				console.error("Error rendering mindmap:", error)
				showTryAgainToast()
			})
	})
}

/**
 * Handles clearing the API key.
 */
function handleClearApiKey() {
	chrome.storage.local.remove(["apiKey"], function () {
		showSuccessToast("API Key cleared successfully!")
		updateApiKeyStatus("")
		document.getElementById("apiKeyInputDialog").value = ""
		apiKey_ = undefined
		closeApiKeyDialog()
		enableButtons(null)
	})
}

/**
 * Handles saving the default prompt.
 */
function handleSaveDefaultPrompt() {
	const defaultPrompt = document
		.getElementById("defaultPromptInputDialog")
		.value.trim()
	if (!defaultPrompt) {
		showErrorToast("Please enter a default prompt!")
		return
	}
	chrome.storage.local.set({ defaultPrompt: defaultPrompt }, function () {
		showSuccessToast("Default Prompt updated successfully!")
		updateDefaultPromptStatus(defaultPrompt)
		defaultPrompt_ = defaultPrompt
	})
}

/**
 * Returns the default prompt text.
 * @returns {string} The default prompt text.
 */
function getDefaultPrompt() {
	return `You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically, with emphasis on compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deem necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with # • Discard any promotional content at the end promoting the author or any product or anything only stick to the central theme of the text`
}

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

/**
 * Shows or hides the loading overlay.
 * @param {boolean} show - Whether to show or hide the overlay
 */
function toggleLoadingOverlay(show) {
	const overlay = document.getElementById("loadingOverlay")
	if (!overlay) {
		console.error("Loading overlay element not found")
		return
	}
	overlay.style.display = show ? "flex" : "none"
}

const showLoadingOverlay = () => toggleLoadingOverlay(true)
const hideLoadingOverlay = () => toggleLoadingOverlay(false)

function showMappingToast() {
	showLoadingOverlay()
	showCustomToast("Started to generate map", "#777700")
}

function showMapGeneratedToast() {
	hideLoadingOverlay()
	showCustomToast("Map Generated", "#00dd00")
}

function showImageDownloadedToast() {
	showCustomToast("Image Downloaded", "#00dd00")
}

function showTryAgainToast() {
	hideLoadingOverlay()
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

function updateTheme() {
	const isDarkMode = document.body.classList.contains("dark-mode")
	const elementsToStyle = document.querySelectorAll(
		"body, #mindmap, #mindmapContainer, #toolbar, #generateButton, #downloadButton, #settingsButton, #saveApiKey, #clearApiKey, #cancelApiKey, #saveDefaultPrompt, #apiKeyDialog, #apiKeyDialog input, #apiKeyDialog textarea, #apiKeyDialog button, #defaultPromptDialog,  #defaultPromptDialog input, #defaultPromptDialog textarea, #defaultPromptDialog button, #loadingOverlay"
	)
	elementsToStyle.forEach((element) => {
		if (isDarkMode) {
			element.classList.add("dark-mode")
		} else {
			element.classList.remove("dark-mode")
		}
	})
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

function openDefaultPromptDialog() {
	document.getElementById("defaultPromptDialog").style.display = "block"
	document.getElementById("defaultPromptInputDialog").focus()
	if (log) console.log("default prompt is " + defaultPrompt_)
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

function updateDefaultPromptStatus(defaultPrompt) {
	const defaultPromptStatus = document.getElementById("defaultPromptStatus")
	if (defaultPrompt && defaultPrompt !== "") {
		defaultPromptStatus.textContent = "Default Prompt set."
	} else {
		defaultPromptStatus.textContent = "Default Prompt needed."
	}
}
