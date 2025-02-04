let apiKey = "" // Declare a variable to hold the key
let defaultPrompt =
	"You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically,with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text" // Declare a variable to hold the default prompt

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get(["apiKey", "defaultPrompt"], (result) => {
		if (result.apiKey !== undefined) {
			apiKey = result.apiKey
		} else {
			apiKey = ""
			console.error("API Key is undefined in storage")
		}
		if (result.defaultPrompt !== undefined) {
			defaultPrompt = result.defaultPrompt
		} else {
			defaultPrompt =
				"You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically,with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text"
			console.error("Default Prompt is undefined in storage")
		}
		console.log("API Key loaded from storage:", apiKey)
		console.log("Default Prompt loaded from storage:", defaultPrompt)
	})
})

// Ensure the API key is retrieved from storage before making any requests
chrome.storage.local.get(["apiKey"], (result) => {
	if (result.apiKey !== undefined) {
		apiKey = result.apiKey
		console.log("API Key loaded from storage:", apiKey)
	} else {
		apiKey = ""
		console.error("API Key is undefined in storage")
	}
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "setApiKey") {
		chrome.storage.local.set({ apiKey: request.apiKey }, () => {
			if (request.apiKey !== undefined) {
				apiKey = request.apiKey
			} else {
				console.error("API Key is undefined in setApiKey request")
			}
			console.log("API Key updated:", apiKey)
			sendResponse({ success: true })
		})
		return true // Indicate asynchronous response
	} else if (request.action === "getApiKey") {
		if (apiKey !== undefined) {
			sendResponse({ apiKey: apiKey })
		} else {
			console.error("API Key is undefined in getApiKey request")
			sendResponse({ apiKey: "" })
		}
	} else if (request.action === "getText") {
		// Ensure the default prompt is loaded from local storage
		chrome.storage.local.get(["defaultPrompt"], (result) => {
			if (result.defaultPrompt !== undefined) {
				defaultPrompt = result.defaultPrompt
			} else {
				defaultPrompt =
					"You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically,with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text"
				console.error("Default Prompt is undefined in storage")
			}
			console.log("Default Prompt loaded from storage:", defaultPrompt)
		})
	} else if (request.action === "clearApiKey") {
		chrome.storage.local.remove(["apiKey"], () => {
			apiKey = undefined
			console.log("API Key cleared from storage")
			sendResponse({ success: true })
		})
		return true // Indicate asynchronous response
	} else if (request.action === "setDefaultPrompt") {
		chrome.storage.local.set({ defaultPrompt: request.defaultPrompt }, () => {
			if (request.defaultPrompt !== undefined) {
				defaultPrompt = request.defaultPrompt
			} else {
				console.error("Default Prompt is undefined in setDefaultPrompt request")
			}
			console.log("Default Prompt updated:", defaultPrompt)
			sendResponse({ success: true })
		})
		return true // Indicate asynchronous response
	} else if (request.action === "getDefaultPrompt") {
		if (defaultPrompt !== undefined) {
			sendResponse({ defaultPrompt: defaultPrompt })
		} else {
			console.error("Default Prompt is undefined in getDefaultPrompt request")
			sendResponse({ defaultPrompt: "" })
		}
	}
})

let isProcessing = false
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getText") {
		if (isProcessing) {
			console.log("Already processing a request, please wait.")
			return // Prevents multiple simultaneous requests
		}
		isProcessing = true
		// Ensure the default prompt is loaded from local storage
		chrome.storage.local.get(["defaultPrompt"], (result) => {
			if (result.defaultPrompt !== undefined) {
				defaultPrompt = result.defaultPrompt
			} else {
				defaultPrompt =
					"You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically,with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text"
				console.error("Default Prompt is undefined in storage")
			}
			console.log("Default Prompt loaded from storage:", defaultPrompt)
		})
		fetchSummary(request.data)
			.then((summary) => {
				chrome.storage.local.set({ summary: summary }, () => {
					chrome.runtime.sendMessage({ action: "updateMap", data: summary })
				})
			})
			.catch((error) => {
				console.error("Error in summary fetch:", error)
				chrome.runtime.sendMessage({
					action: "showErrorToast",
					message:
						"Error generating map. Please close and open the extension or try again.",
				})
			})
			.finally(() => {
				isProcessing = false // Reset the flag
			})
	}
})

async function fetchSummary(text) {
	try {
		// Check if the API key is valid
		if (!apiKey) {
			throw new Error("API Key is not set")
		}

		// Here we use the Gemini API endpoint to generate a summary.
		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`

		const response = await fetch(endpoint, {
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
		})

		// Check if the response was successful
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const data = await response.json()

		// Gemini API response format might differ, here we assume it returns text in a certain structure
		return data.candidates[0].content.parts[0].text // Adjust based on actual response structure
	} catch (error) {
		chrome.runtime.sendMessage({
			action: "showErrorToast",
			message:
				"Error generating map. Please close and open the extension or try again.",
		})
		console.error("Error in fetchSummary:", error)
		return "Error generating summary" // or some default message
	}
}
