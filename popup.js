const { Transformer, builtInPlugins } = window.markmap
const { loadCSS, loadJS, Markmap, Toolbar } = window.markmap

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.action === "updateMap") {
		showLoading()
		renderMindmap(request.data || sampleMarkdown)
			.then(() => {
				hideLoading()
			})
			.catch((error) => {
				console.error("Error rendering mindmap:", error)
				hideLoading() // Hide loading if there's an error
			})
	}
})

const options = {
	duration: 500,
	maxWidth: 400,
	initialExpandLevel: 2,
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

/* const { markmap } = window
const { Toolbar } = markmap */

function renderMindmap(markdown) {
	return new Promise((resolve) => {
		console.log("rendering mindmap")
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

		console.log(Toolbar)

		// Create markmap
		let mm = Markmap.create(svgEl, options, root)

		const { el } = Toolbar.create(mm)

		setupToolbar(el, mindmapContainer)

		resolve()
	})
}

// Request summary if available immediately on popup open
document.addEventListener("DOMContentLoaded", () => {
	// Your existing popup.js code, including the renderMindmap function definition
	// chrome.storage.local.get(["summary"], function (result) {
	showLoading()
	/* 		if (result.summary) {
			renderMindmap(result.summary)
				.then(() => {
					hideLoading()
				})
				.catch((error) => {
					console.error("Error rendering initial mindmap:", error)
					hideLoading() // Hide loading if there's an error
				})
		} else { */
	renderMindmap(sampleMarkdown)
		.then(() => {
			hideLoading()
		})
		.catch((error) => {
			console.error("Error rendering sample mindmap:", error)
			hideLoading() // Hide loading if there's an error
		}) // Use sample if no summary available
	// }
	// })

	document
		.getElementById("generateButton")
		.addEventListener("click", function () {
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
						showLoading()
						chrome.runtime.sendMessage({
							action: "getText",
							data: results[0].result,
						})
					}
				)
			})
		})

	// Assuming you've included the library in your HTML or it's globally available
	document
		.getElementById("downloadButton")
		.addEventListener("click", async function () {
			const mindmap = document.getElementById("mindmapContainer") // Ensure this matches your SVG element's ID

			try {
				const title = document.title // Get the page title
				const dataUrl = await htmlToImage.toPng(mindmap, {
					backgroundColor: "black",
					width: mindmap.clientWidth,
					height: mindmap.clientHeight,
					pixelRatio: 5,
				})

				// Create an anchor element to trigger the download
				const link = document.createElement("a")
				link.download = `${title}.png` // Rename using page title
				link.href = dataUrl
				// Append to the body, click it, then remove it
				document.body.appendChild(link)
				link.click()
				document.body.removeChild(link)
			} catch (error) {
				console.error("Error while creating screenshot:", error)
				alert(
					"An error occurred while downloading the mindmap. Please try again."
				)
			}
		})
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

	console.log("added toolbar")
}

function showLoading() {
	document.getElementById("loadingIndicator").style.display = "block"
}

function hideLoading() {
	document.getElementById("loadingIndicator").style.display = "none"
}
