let isProcessing = false
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "getText") {
		if (isProcessing) {
			console.log("Already processing a request, please wait.")
			return // Prevents multiple simultaneous requests
		}
		isProcessing = true
		fetchSummary(request.data)
			.then((summary) => {
				chrome.storage.local.set({ summary: summary }, () => {
					chrome.runtime.sendMessage({ action: "updateMap", data: summary })
				})
			})
			.catch((error) => {
				console.error("Error in summary fetch:", error)
			})
			.finally(() => {
				isProcessing = false // Reset the flag
			})
	}
})

async function fetchSummary(text) {
	try {
		// existing code

		// Here we use the Gemini API endpoint to generate a summary.

		const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

		const defaultPrompt = `You are an expert in creating clear, structured, and visually intuitive mindmaps in Markdown format. Given the following text input, your goal is to extract all the core ideas and details to create a mindmap that is neither too detailed nor too sparse. The mindmap must highlight the main topics, subtopics, and supporting points in a hierarchical structure. • Organize the content logically,with emphasis of compactness and extracting the essential points. • Use concise phrases and bullet points for clarity. • Make the mindmaps very compact and on point. • Always ensure the Markdown format is accurate and clean, making it easy to read and render. • Use appropriate indentation to show relationships between main topics and subtopics. • Create a compact title for the mindmap, ideally no longer than 10 words. • Use #, ## and ### for main branches and use - to indent further sub branches • Use bold and italic text as you deen necessary • Feel free to judge the amount of details to include given the detail to be included is absolutely essential and is useful • Always[IMPORTANT] make sure there's a root title that's marked with #  • Discard any promotional content at the end promoting the author or any product or anything only sitck to the central theme of the text # • MANDATORY! always add a brand last sub-branch in bold text always "mapped with ❤️ by xar - like, repost and follow"`

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
		console.error("Error in fetchSummary:", error)
		return "Error generating summary" // or some default message
	}
}
