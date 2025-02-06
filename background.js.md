# background.js Documentation

This file contains the background script for the Chrome extension. It handles the following:

- **API Key Management**: Stores and retrieves the API key used to communicate with the Google Gemini API.
- **Default Prompt Management**: Stores and retrieves the default prompt used to guide the summarization process.
- **Communication with Google Gemini API**: Sends requests to the Gemini API to generate mind maps from web page content.
- **Message Handling**: Listens for messages from the popup script and content scripts, and performs actions based on the message type.

## Functions

### `loadSettingsFromStorage()`

Loads the API key and default prompt from local storage.

- **Purpose**: Retrieves the API key and default prompt from Chrome's local storage.
- **Details**: This function is called when the extension is installed or started. It retrieves the `apiKey` and `defaultPrompt` from local storage and updates the corresponding variables in the background script. If the values are not found in storage, default values are used.
- **Return Value**: A Promise that resolves when the settings are loaded.

### `chrome.runtime.onMessage.addListener()`

Listens for messages from the popup script and content scripts.

- **Purpose**: Handles incoming messages and performs actions based on the message type.
- **Details**: This listener handles messages from the popup script (e.g., setting the API key, getting the API key) and content scripts (e.g., getting the text from the current tab). It uses a switch statement to determine the appropriate action to take based on the `request.action` property.
- **Actions**:
  - `setApiKey`: Sets the API key in local storage.
  - `getApiKey`: Retrieves the API key from local storage.
  - `getText`: Retrieves the text from the current tab and sends it to the Gemini API for summarization.
  - `clearApiKey`: Clears the API key from local storage.
  - `setDefaultPrompt`: Sets the default prompt in local storage.
  - `getDefaultPrompt`: Retrieves the default prompt from local storage.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `fetchSummary(text)`

Fetches a summary from the Google Gemini API.

- **Purpose**: Sends a request to the Gemini API to generate a mind map from the given text.
- **Details**: This function takes the text from the current tab as input and sends it to the Gemini API along with the default prompt. The API generates a mind map in Markdown format, which is then returned by the function.
- **Parameters**:
  - `text`: The text to summarize.
- **Return Value**: A Promise that resolves with the summary text.

### `fetchWithTimeout(resource, options = {})`

Fetches a resource with a timeout.

- **Purpose**: Sends a request to a resource with a specified timeout.
- **Details**: This function is a wrapper around the `fetch` API that adds a timeout. If the request takes longer than the specified timeout, the request is aborted.
- **Parameters**:
  - `resource`: The URL to fetch.
  - `options`: The options to pass to the `fetch` API.
- **Return Value**: A Promise that resolves with the response from the resource.

### `showErrorToast(message)`

Shows an error toast in the popup.

- **Purpose**: Displays an error message in the popup.
- **Details**: This function sends a message to the popup script to display an error message in a toast notification.
- **Parameters**:
  - `message`: The error message to display.
- **Return Value**: None.
