let apiKey = "" // Initialize apiKey
let defaultPrompt = `You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse.  The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically, with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text`

// Constants
const GEMINI_API_ENDPOINT =
	"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
const DEFAULT_TIMEOUT = 10000
const MAX_RETRIES = 3

// Initialize settings on installation and startup
chrome.runtime.onInstalled.addListener(() => loadSettingsFromStorage())
chrome.runtime.onStartup.addListener(() => loadSettingsFromStorage())

// Load settings from storage
async function loadSettingsFromStorage() {
	try {
		const result = await chrome.storage.local.get(["apiKey", "defaultPrompt"])
		apiKey = result.apiKey || ""
		defaultPrompt = result.defaultPrompt || defaultPrompt
		console.log("Settings loaded successfully")
	} catch (error) {
		console.error("Error loading settings:", error)
		showErrorToast("Failed to load settings")
	}
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	handleMessage(request, sender, sendResponse)
	return true // Indicate asynchronous response
})

// Handle incoming messages
async function handleMessage(request, sender, sendResponse) {
	try {
		switch (request.action) {
			case "setApiKey":
				await handleSetApiKey(request, sendResponse)
				break
			case "getApiKey":
				sendResponse({ apiKey })
				break
			case "getText":
				await handleGetText(request)
				sendResponse({ success: true })
				break
			case "clearApiKey":
				await handleClearApiKey(sendResponse)
				break
			case "setDefaultPrompt":
				await handleSetDefaultPrompt(request, sendResponse)
				break
			case "getDefaultPrompt":
				sendResponse({ defaultPrompt })
				break
			default:
				sendResponse({ success: false, message: "Unknown action" })
		}
	} catch (error) {
		console.error("Error handling message:", error)
		sendResponse({ success: false, message: error.message })
	}
}

// API key handlers
async function handleSetApiKey(request, sendResponse) {
	apiKey = request.apiKey || ""
	await chrome.storage.local.set({ apiKey })
	console.log("API Key updated")
	sendResponse({ success: true })
}

async function handleClearApiKey(sendResponse) {
	apiKey = ""
	await chrome.storage.local.remove(["apiKey"])
	console.log("API Key cleared")
	sendResponse({ success: true })
}

// Default prompt handler
async function handleSetDefaultPrompt(request, sendResponse) {
	defaultPrompt = request.defaultPrompt || defaultPrompt
	await chrome.storage.local.set({ defaultPrompt })
	console.log("Default Prompt updated")
	sendResponse({ success: true })
}

// Text processing handler
async function handleGetText(request) {
	await loadSettingsFromStorage()
	validateApiKey()

	try {
		const summary = await fetchSummary(request.data)
		await chrome.storage.local.set({ summary })
		chrome.runtime.sendMessage({ action: "updateMap", data: summary })
	} catch (error) {
		handleError(error)
	}
}

// Fetch summary with retry mechanism
// Function to decode HTML entities using pure JavaScript
function decodeHTMLEntities(text) {
	const entities = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": '"',
		"&#39;": "'",
		"&nbsp;": " ",
	}
	return text.replace(/&[#\w]+;/g, (entity) => entities[entity] || entity)
}

async function fetchSummary(text) {
	let attempt = 0
	while (attempt < MAX_RETRIES) {
		try {
			const response = await fetchWithTimeout(
				`${GEMINI_API_ENDPOINT}?key=${apiKey}`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						contents: [
							{
								parts: [
									{
										text: `Summarize the following text in markdown format for use in a mind map, here's the structure you should follow : ${defaultPrompt} and here's the text you have to map:\n\n${text}`,
									},
								],
							},
						],
					}),
					timeout: DEFAULT_TIMEOUT,
				}
			)

			if (!response.ok) {
				const errorText = await response.text()
				throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
			}

			const data = await response.json()
			// Decode HTML entities in the response text
			return decodeHTMLEntities(data.candidates[0].content.parts[0].text)
		} catch (error) {
			attempt++
			if (attempt === MAX_RETRIES) throw error
			console.warn(`Retry attempt ${attempt} of ${MAX_RETRIES}`)
			await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
		}
	}
}

// Utility functions
async function fetchWithTimeout(resource, options = {}) {
	const { timeout = DEFAULT_TIMEOUT } = options
	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), timeout)

	try {
		const response = await fetch(resource, {
			...options,
			signal: controller.signal,
		})
		clearTimeout(id)
		return response
	} catch (error) {
		clearTimeout(id)
		throw error
	}
}

function validateApiKey() {
	if (!apiKey) {
		throw new Error(
			"API Key is not set. Please set your API key in the options."
		)
	}
}

function handleError(error) {
	console.error("Operation failed:", error)
	showErrorToast(error.message)
	chrome.runtime.sendMessage({ action: "hideLoadingOverlay" })
}

function showErrorToast(message) {
	chrome.runtime.sendMessage({
		action: "showErrorToast",
		message: message || "An unexpected error occurred",
	})
}
