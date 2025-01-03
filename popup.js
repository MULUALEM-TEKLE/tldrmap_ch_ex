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
		console.log("resquest to update the map accepted")
		renderMindmap(request.data || sampleMarkdown)
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
	console.log("rendering mindmap")
	const mindmapContainer = document.getElementById("mindmap")
	mindmapContainer.innerHTML = "" // Clear previous content

	// Create SVG element for markmap
	const svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg")
	svgEl.setAttribute("id", "mindmapContainer")
	svgEl.setAttribute("style", "width: 500px; height: 500px;") // Adjust size as needed
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
}

// Request summary if available immediately on popup open
document.addEventListener("DOMContentLoaded", () => {
	// Your existing popup.js code, including the renderMindmap function definition
	chrome.storage.local.get(["summary"], function (result) {
		if (result.summary) {
			renderMindmap(result.summary)
		} else {
			renderMindmap(sampleMarkdown) // Use sample if no summary available
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
