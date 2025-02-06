let apiKey = "" // Initialize apiKey
let defaultPrompt = `You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse.  The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically, with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text`

chrome.runtime.onInstalled.addListener(() => {
	loadSettingsFromStorage()
})

chrome.runtime.onStartup.addListener(() => {
	loadSettingsFromStorage()
})

function loadSettingsFromStorage() {
	chrome.storage.local.get(["apiKey", "defaultPrompt"], (result) => {
		apiKey = result.apiKey || ""
		defaultPrompt = result.defaultPrompt || defaultPrompt // Use default if not in storage
		console.log("API Key loaded from storage:", apiKey)
		console.log("Default Prompt loaded from storage:", defaultPrompt)
	})
}

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
	switch (request.action) {
		case "setApiKey":
			apiKey = request.apiKey || ""
			chrome.storage.local.set({ apiKey: apiKey }, () => {
				console.log("API Key updated:", apiKey)
				sendResponse({ success: true })
			})
			return true // Indicate asynchronous response

		case "getApiKey":
			sendResponse({ apiKey: apiKey })
			return true // Indicate synchronous response

		case "getText":
			loadSettingsFromStorage() // Load settings before processing text
			try {
				const summary = await fetchSummary(request.data)
				chrome.storage.local.set({ summary: summary }, () => {
					chrome.runtime.sendMessage({ action: "updateMap", data: summary })
				})
			} catch (error) {
				console.error("Error in summary fetch:", error)
				showErrorToast(error.message) // Show specific error message
				chrome.runtime.sendMessage({ action: "hideLoadingOverlay" })
			} finally {
				sendResponse({ success: true }) // Send response to avoid timeouts
			}
			return true // Indicate asynchronous response

		case "clearApiKey":
			apiKey = ""
			chrome.storage.local.remove(["apiKey"], () => {
				console.log("API Key cleared from storage")
				sendResponse({ success: true })
			})
			return true // Indicate asynchronous response

		case "setDefaultPrompt":
			defaultPrompt = request.defaultPrompt || defaultPrompt
			chrome.storage.local.set({ defaultPrompt: defaultPrompt }, () => {
				console.log("Default Prompt updated:", defaultPrompt)
				sendResponse({ success: true })
			})
			return true // Indicate asynchronous response

		case "getDefaultPrompt":
			sendResponse({ defaultPrompt: defaultPrompt })
			return true // Indicate synchronous response

		default:
			sendResponse({ success: false, message: "Unknown action" })
			return true // Indicate synchronous response
	}
})

async function fetchSummary(text) {
	if (!apiKey) {
		showErrorToast(
			"API Key is not set. Please set your API key in the options."
		)
		throw new Error("Something went wrong, please try again, =)")
	}

	if (!apiKey) {
		showErrorToast("API Key is not loaded. Please try again later.")
		throw new Error("API Key is not loaded. Please try again later.")
	}

	// Here we use the Gemini API endpoint to generate a summary.
	const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

	const response = await fetchWithTimeout(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
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
		timeout: 10000, // 10 seconds timeout
	})

	// Check if the response was successful
	if (!response.ok) {
		const errorText = await response.text() // Get error message from body
		console.error("Gemini API Error:", errorText)
		showErrorToast(`Gemini API Error: ${response.status} - ${errorText}`) // Show error to user
		throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
	}

	const data = await response.json()

	// Gemini API response format might differ, here we assume it returns text in a certain structure
	return data.candidates[0].content.parts[0].text // Adjust based on actual response structure
}

async function fetchWithTimeout(resource, options = {}) {
	const { timeout = 8000 } = options

	const controller = new AbortController()
	const id = setTimeout(() => controller.abort(), timeout)
	const response = await fetch(resource, {
		...options,
		signal: controller.signal,
	})
	clearTimeout(id)

	return response
}

function showErrorToast(message) {
	chrome.runtime.sendMessage({
		action: "showErrorToast",
		message: message,
	})
}
