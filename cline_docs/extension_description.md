# Gemini Markmap Extension

## Overview

The Gemini Markmap Extension is a Chrome extension designed to help users create visual mind maps from web pages. It leverages the Google Gemini API for summarization and Markmap for rendering the mind maps. The extension provides a user-friendly interface to interact with the mind maps and offers features such as API key management, default prompt customization, and dark mode support.

## Features

### Mind Map Generation

- **Google Gemini API Integration**: The extension uses the Google Gemini API to summarize web page content and generate a mind map in Markdown format.
- **Markmap Rendering**: The summarized content is rendered as a visual mind map using the Markmap library.
- **Customizable Prompts**: Users can set a default prompt to guide the summarization process, ensuring that the mind map is tailored to their needs.

### User Interface

- **Popup Interface**: The extension's popup interface allows users to interact with the mind map, including generating a new map, downloading the map as an image, and managing API keys.
- **API Key Management**: Users can set, clear, and manage their API keys directly from the popup interface.
- **Dark Mode**: The extension supports a dark mode for better visibility in low-light conditions.

### Background Tasks

- **Background Script**: The `background.js` script handles background tasks such as fetching summaries from the Google Gemini API and storing user settings.
- **Storage Management**: User settings, including API keys and default prompts, are stored locally using Chrome's storage API.

## Usage

1. **Install the Extension**: Install the Gemini Markmap Extension from the Chrome Web Store.
2. **Open the Popup**: Click on the extension icon in the Chrome toolbar to open the popup interface.
3. **Generate Mind Map**: Click the "Generate" button to summarize the current web page content and render it as a mind map.
4. **Download Mind Map**: Click the "Download" button to save the mind map as an image.
5. **Manage API Key**: Set or clear your API key from the settings dialog.
6. **Customize Prompt**: Set a default prompt to guide the summarization process.

## Technical Details

### `popup.js`

The `popup.js` file handles the functionality of the popup interface, including:

- **Markmap Initialization**: Initializes the Markmap library and renders the mind map.
- **API Key Management**: Allows users to set, clear, and manage their API keys.
- **Event Listeners**: Handles events such as button clicks, API key updates, and default prompt updates.
- **Toast Notifications**: Displays toast notifications for various actions, such as map generation and API key updates.

### `background.js`

The `background.js` file handles background tasks, including:

- **API Key Storage**: Stores and retrieves API keys and default prompts using Chrome's storage API.
- **Summary Fetching**: Fetches summaries from the Google Gemini API and updates the mind map.
- **Error Handling**: Handles errors gracefully and displays appropriate error messages.

## Conclusion

The Gemini Markmap Extension is a powerful tool for creating visual mind maps from web pages. It leverages the Google Gemini API for summarization and provides a user-friendly interface for interacting with the mind maps. With features such as API key management, default prompt customization, and dark mode support, the extension offers a comprehensive solution for mind mapping.
