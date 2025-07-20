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
	if (!text) return text

	// Comprehensive map of HTML entities
	const entities = {
		"&amp;": "&",
		"&lt;": "<",
		"&gt;": ">",
		"&quot;": '"',
		"&apos;": "'",
		"&#39;": "'",
		"&nbsp;": " ",
		"&cent;": "¢",
		"&pound;": "£",
		"&yen;": "¥",
		"&euro;": "€",
		"&copy;": "©",
		"&reg;": "®",
		"&trade;": "™",
		"&mdash;": "—",
		"&ndash;": "–",
		"&hellip;": "…",
		"&lsquo;": "'",
		"&rsquo;": "'",
		"&ldquo;": '"',
		"&rdquo;": '"',
	}

	let result = text

	// Handle numeric entities first
	result = result.replace(/&#(\d+);/g, (match, numStr) => {
		const num = parseInt(numStr, 10)
		return String.fromCharCode(num)
	})

	// Handle hex entities
	result = result.replace(/&#x([\da-f]+);/gi, (match, hexStr) => {
		const hex = parseInt(hexStr, 16)
		return String.fromCharCode(hex)
	})

	// Handle named entities - replace each entity directly
	for (const [entity, replacement] of Object.entries(entities)) {
		result = result.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement)
	}

	return result
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
			// Decode HTML entities in the response text and ensure proper markdown formatting
			let decodedText = decodeHTMLEntities(
				data.candidates[0].content.parts[0].text
			)

			// Ensure proper newline handling
			decodedText = decodedText.replace(/\\n/g, "\n").trim()

			// Validate and fix markdown structure for markmap
			decodedText = validateMarkdownStructure(decodedText)

			return decodedText
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

/**
 * Validates and fixes markdown structure to ensure it renders properly in markmap
 * @param {string} markdown - The markdown content to validate
 * @returns {string} - The validated and fixed markdown
 */
function validateMarkdownStructure(markdown) {
	// Remove markdown code block delimiters if present
	markdown = markdown.replace(/^```markdown\n|^```\n|\n```$/g, "")

	// First, check if the markdown is already well-structured
	const hasProperStructure =
		/^\s*#\s+[^\n]+/.test(markdown) &&
		(/\n\s*#{2}\s+[^\n]+/.test(markdown) || /\n\s*-\s+[^\n]+/.test(markdown))

	// If it's not well-structured, try to fix it
	if (!hasProperStructure) {
		// Extract lines and analyze structure
		const lines = markdown.split("\n")
		let structuredMarkdown = ""
		let mainTitle = ""

		// Find a suitable title
		for (let i = 0; i < Math.min(5, lines.length); i++) {
			if (lines[i].trim() && !lines[i].trim().startsWith("-")) {
				mainTitle = lines[i].trim().replace(/^#{1,6}\s+/, "")
				break
			}
		}

		if (!mainTitle && lines.length > 0) {
			mainTitle = "Mind Map"
		}

		// Start with the main title
		structuredMarkdown = `# ${mainTitle}\n\n`

		// Process the rest of the content
		let currentSection = ""
		let inList = false

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim()

			// Skip empty lines and the line we used as title
			if (!line || line === mainTitle) continue

			// Check if it's a heading
			if (line.startsWith("##")) {
				// It's already a subheading, keep it
				if (inList) {
					structuredMarkdown += "\n"
					inList = false
				}
				structuredMarkdown += line + "\n\n"
				currentSection = line.replace(/^#{1,6}\s+/, "")
			} else if (line.startsWith("#")) {
				// Convert main headings to subheadings
				if (inList) {
					structuredMarkdown += "\n"
					inList = false
				}
				const subheading = line.replace(/^#\s+/, "## ")
				structuredMarkdown += subheading + "\n\n"
				currentSection = subheading.replace(/^#{1,6}\s+/, "")
			} else if (line.startsWith("-")) {
				// It's a list item
				if (!inList && !line.includes(":")) {
					// If we're not in a list yet and this doesn't look like a definition,
					// add a subheading if we don't have one
					if (!currentSection) {
						currentSection = "Details"
						structuredMarkdown += `## ${currentSection}\n\n`
					}
				}

				// Ensure proper spacing for list items
				let formattedItem = line
				if (!formattedItem.startsWith("- ")) {
					formattedItem = formattedItem.replace(/^-/, "- ")
				}

				// Check if this should be a nested item
				if (inList && i > 0) {
					const prevLine = lines[i - 1].trim()
					if (prevLine.startsWith("-")) {
						// Check if this item is related to the previous one
						if (
							prevLine.endsWith(":") ||
							prevLine.includes("such as") ||
							prevLine.includes("including")
						) {
							// This should be a nested item
							formattedItem = "  " + formattedItem
						}
					}
				}

				structuredMarkdown += formattedItem + "\n"
				inList = true
			} else {
				// Regular text - convert to a subheading or list item
				if (line.length < 50 && line.endsWith(":")) {
					// Looks like a section title
					if (inList) {
						structuredMarkdown += "\n"
						inList = false
					}
					currentSection = line.replace(/:$/, "")
					structuredMarkdown += `## ${currentSection}\n\n`
				} else {
					// Convert to list item
					structuredMarkdown += `- ${line}\n`
					inList = true
				}
			}
		}

		// Use the restructured markdown
		markdown = structuredMarkdown
	} else {
		// The markdown already has good structure, just apply some fixes

		// Ensure proper heading hierarchy
		// Replace any malformed headings (ensure space after #)
		markdown = markdown.replace(/^(#{1,6})([^\s#][^\n]*)/gm, "$1 $2")

		// Ensure proper list formatting
		// Fix lists that don't have proper spacing
		markdown = markdown.replace(/^(\s*)-([^\s])/gm, "$1- $2")

		// Ensure there are blank lines before headings for proper parsing
		markdown = markdown.replace(/([^\n])\n(#{1,6}\s+)/g, "$1\n\n$2")

		// Ensure there are blank lines before lists that follow headings
		markdown = markdown.replace(/(#{1,6}[^\n]*)\n(\s*-\s+)/g, "$1\n\n$2")
	}

	// Final cleanup
	// Remove any excessive blank lines (more than 2 consecutive)
	markdown = markdown.replace(/\n{3,}/g, "\n\n")

	// Ensure the document ends with a newline
	if (!markdown.endsWith("\n")) {
		markdown += "\n"
	}

	return markdown
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
