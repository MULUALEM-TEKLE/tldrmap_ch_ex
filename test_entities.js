// Test script to verify HTML entity decoding

// Copy the fixed decodeHTMLEntities function
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

// Test cases
const testCases = [
	"This &amp; that",
	"&lt;div&gt; element",
	"&quot;Hello World&quot;",
	"Multiple &amp; entities &lt; here &gt;",
	"Mixed &#65; and &amp; entities",
	"Hex &#x41; entity"
]

console.log("Testing HTML entity decoding:")
testCases.forEach((test, index) => {
	const result = decodeHTMLEntities(test)
	console.log(`Test ${index + 1}:`)
	console.log(`  Input:  ${test}`)
	console.log(`  Output: ${result}`)
	console.log()
})