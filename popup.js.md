# popup.js Documentation

This file contains the script for the extension's popup. It handles the following:

- **User Interactions**: Handles user input and button clicks in the popup.
- **Mind Map Display**: Renders the mind map in the popup using the markmap library.
- **API Key and Default Prompt Settings**: Manages the API key and default prompt settings, allowing users to update them.
- **Communication with Background Script**: Sends messages to the background script to perform actions such as fetching the summary and updating settings.
- **UI Updates**: Updates the UI based on the state of the application, such as showing loading indicators and error messages.

## Functions

### `handleUpdateMap(request, sender, sendResponse)`

Handles the `updateMap` message from the background script.

- **Purpose**: Renders the mind map in the popup.
- **Details**: This function is called when the background script sends an `updateMap` message with the summary data. It calls the `renderMindmap` function to render the mind map in the popup.
- **Parameters**:
  - `request`: The request object containing the summary data.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: None.

### `handleShowSuccessToast(request, sender, sendResponse)`

Handles the `showSuccessToast` message from the background script.

- **Purpose**: Displays a success toast in the popup.
- **Details**: This function is called when the background script sends a `showSuccessToast` message with a success message. It calls the `showSuccessToast` function to display the message in a toast notification.
- **Parameters**:
  - `request`: The request object containing the success message.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: None.

### `handleShowErrorToast(request, sender, sendResponse)`

Handles the `showErrorToast` message from the background script.

- **Purpose**: Displays an error toast in the popup.
- **Details**: This function is called when the background script sends a `showErrorToast` message with an error message. It calls the `showErrorToast` function to display the message in a toast notification.
- **Parameters**:
  - `request`: The request object containing the error message.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: None.

### `handleHideLoadingOverlay(request, sender, sendResponse)`

Handles the `hideLoadingOverlay` message from the background script.

- **Purpose**: Hides the loading overlay in the popup.
- **Details**: This function is called when the background script sends a `hideLoadingOverlay` message. It calls the `hideLoadingOverlay` function to hide the loading overlay in the popup.
- **Parameters**:
  - `request`: The request object.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: None.

### `handleGetApiKey(request, sender, sendResponse)`

Handles the `getApiKey` message from the background script.

- **Purpose**: Retrieves the API key from local storage.
- **Details**: This function is called when the background script sends a `getApiKey` message. It retrieves the API key from local storage and sends it back to the background script.
- **Parameters**:
  - `request`: The request object.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `handleSetApiKey(request, sender, sendResponse)`

Handles the `setApiKey` message from the background script.

- **Purpose**: Sets the API key in local storage.
- **Details**: This function is called when the background script sends a `setApiKey` message with the new API key. It sets the API key in local storage and sends a success message back to the background script.
- **Parameters**:
  - `request`: The request object containing the new API key.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `handleClearApiKey(request, sender, sendResponse)`

Handles the `clearApiKey` message from the background script.

- **Purpose**: Clears the API key from local storage.
- **Details**: This function is called when the background script sends a `clearApiKey` message. It clears the API key from local storage and sends a success message back to the background script.
- **Parameters**:
  - `request`: The request object.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `handleGetDefaultPrompt(request, sender, sendResponse)`

Handles the `getDefaultPrompt` message from the background script.

- **Purpose**: Retrieves the default prompt from local storage.
- **Details**: This function is called when the background script sends a `getDefaultPrompt` message. It retrieves the default prompt from local storage and sends it back to the background script.
- **Parameters**:
  - `request`: The request object.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `handleSetDefaultPrompt(request, sender, sendResponse)`

Handles the `setDefaultPrompt` message from the background script.

- **Purpose**: Sets the default prompt in local storage.
- **Details**: This function is called when the background script sends a `setDefaultPrompt` message with the new default prompt. It sets the default prompt in local storage and sends a success message back to the background script.
- **Parameters**:
  - `request`: The request object containing the new default prompt.
  - `sender`: The sender of the message.
  - `sendResponse`: The function to send a response to the sender.
- **Return Value**: `true` to indicate that the response will be sent asynchronously.

### `renderMindmap(markdown)`

Renders a mindmap from the given Markdown content.

- **Purpose**: Renders a mindmap from the given Markdown content.
- **Details**: This function takes the Markdown content as input and renders a mindmap using the markmap library. It first clears the previous content in the mindmap container, then creates an SVG element for the mindmap, and finally transforms the Markdown to Markmap data and renders the mindmap.
- **Parameters**:
  - `markdown`: The Markdown content to render.
- **Return Value**: A Promise that resolves when the mindmap is rendered.

### `enableButtons(apiKey)`

Enables or disables buttons based on the presence of an API key.

- **Purpose**: Enables or disables buttons based on the presence of an API key.
- **Details**: This function takes the API key as input and enables or disables the generate and download buttons based on whether the API key is set.
- **Parameters**:
  - `apiKey`: The API key to check.
- **Return Value**: None.

### `initializeApp()`

Initializes the application by setting up event listeners and loading initial data.

- **Purpose**: Initializes the application.
- **Details**: This function is called when the popup is opened. It calls the `toggleDarkMode`, `loadInitialData`, and `setupEventListeners` functions to initialize the application.
- **Return Value**: None.

### `loadInitialData()`

Loads initial data from local storage and sets up the UI.

- **Purpose**: Loads initial data from local storage.
- **Details**: This function retrieves the API key and default prompt from local storage and updates the UI accordingly.
- **Return Value**: None.

### `setupEventListeners()`

Sets up event listeners for various UI elements.

- **Purpose**: Sets up event listeners for various UI elements.
- **Details**: This function sets up event listeners for the API key input, the default prompt input, the settings button, the mode button, the generate button, the download button, the save API key button, the clear API key button, the cancel API key button, and the save default prompt button.
- **Return Value**: None.

### `handleApiKeyChange()`

Handles changes to the API key input.

- **Purpose**: Handles changes to the API key input.
- **Details**: This function is called when the user changes the value of the API key input. It sends a message to the background script to update the API key in local storage.
- **Return Value**: None.

### `handleDefaultPromptChange()`

Handles changes to the default prompt input.

- **Purpose**: Handles changes to the default prompt input.
- **Details**: This function is called when the user changes the value of the default prompt input. It sends a message to the background script to update the default prompt in local storage.
- **Return Value**: None.

### `toggleDarkMode()`

Toggles dark mode.

- **Purpose**: Toggles dark mode.
- **Details**: This function toggles the `dark-mode` class on the body element and updates the mode button icon accordingly.
- **Return Value**: None.

### `handleGenerateButtonClick()`

Handles the generate button click event.

- **Purpose**: Handles the generate button click event.
- **Details**: This function is called when the user clicks the generate button. It sends a message to the content script to get the text from the current tab, then sends a message to the background script to generate the mind map.
- **Return Value**: None.

### `handleDownloadButtonClick()`

Handles the download button click event.

- **Purpose**: Handles the download button click event.
- **Details**: This function is called when the user clicks the download button. It generates a PNG image of the mind map and prompts the user to download it.
- **Return Value**: None.

### `handleSaveApiKey()`

Handles saving the API key.

- **Purpose**: Handles saving the API key.
- **Details**: This function is called when the user clicks the save API key button. It retrieves the API key from the input field, saves it to local storage, and updates the UI accordingly.
- **Return Value**: None.

### `handleClearApiKey()`

Handles clearing the API key.

- **Purpose**: Handles clearing the API key.
- **Details**: This function is called when the user clicks the clear API key button. It clears the API key from local storage and updates the UI accordingly.
- **Return Value**: None.

### `handleSaveDefaultPrompt()`

Handles saving the default prompt.

- **Purpose**: Handles saving the default prompt.
- **Details**: This function is called when the user clicks the save default prompt button. It retrieves the default prompt from the input field, saves it to local storage, and updates the UI accordingly.
- **Return Value**: None.

### `getDefaultPrompt()`

Returns the default prompt text.

- **Purpose**: Returns the default prompt text.
- **Details**: This function returns the default prompt text.
- **Return Value**: The default prompt text.

### `setupToolbar(el, container)`

Helper function to style and append the toolbar

- **Purpose**: Helper function to style and append the toolbar
- **Details**: This function styles the toolbar and appends it to the container.
- **Return Value**: None

### `showLoadingOverlay()`

Shows the loading overlay.

- **Purpose**: Shows the loading overlay.
- **Details**: This function shows the loading overlay.
- **Return Value**: None

### `hideLoadingOverlay()`

Hides the loading overlay.

- **Purpose**: Hides the loading overlay.
- **Details**: This function hides the loading overlay.
- **Return Value**: None

### `showMappingToast()`

Shows the mapping toast.

- **Purpose**: Shows the mapping toast.
- **Details**: This function shows the mapping toast.
- **Return Value**: None

### `showMapGeneratedToast()`

Shows the map generated toast.

- **Purpose**: Shows the map generated toast.
- **Details**: This function shows the map generated toast.
- **Return Value**: None

### `showImageDownloadedToast()`

Shows the image downloaded toast.

- **Purpose**: Shows the image downloaded toast.
- **Details**: This function shows the image downloaded toast.
- **Return Value**: None

### `showTryAgainToast()`

Shows the try again toast.

- **Purpose**: Shows the try again toast.
- **Details**: This function shows the try again toast.
- **Return Value**: None

### `showCustomToast(message, backgroundColor)`

Shows a custom toast.

- **Purpose**: Shows a custom toast.
- **Details**: This function shows a custom toast with the given message and background color.
- **Parameters**:
  - `message`: The message to display.
  - `backgroundColor`: The background color of the toast.
- **Return Value**: None

### `updateTheme()`

Updates the theme.

- **Purpose**: Updates the theme.
- **Details**: This function updates the theme of the popup based on the current dark mode setting.
- **Return Value**: None

### `openApiKeyDialog()`

Opens the API key dialog.

- **Purpose**: Opens the API key dialog.
- **Details**: This function opens the API key dialog.
- **Return Value**: None

### `closeApiKeyDialog()`

Closes the API key dialog.

- **Purpose**: Closes the API key dialog.
- **Details**: This function closes the API key dialog.
- **Return Value**: None

### `openDefaultPromptDialog()`

Opens the default prompt dialog.

- **Purpose**: Opens the default prompt dialog.
- **Details**: This function opens the default prompt dialog.
- **Return Value**: None

### `showSuccessToast(message)`

Shows a success toast.

- **Purpose**: Shows a success toast.
- **Details**: This function shows a success toast with the given message.
- **Parameters**:
  - `message`: The message to display.
- **Return Value**: None

### `showErrorToast(message)`

Shows an error toast.

- **Purpose**: Shows an error toast.
- **Details**: This function shows an error toast with the given message.
- **Parameters**:
  - `message`: The message to display.
- **Return Value**: None

### `updateApiKeyStatus(apiKey)`

Updates the API key status.

- **Purpose**: Updates the API key status.
- **Details**: This function updates the API key status in the UI based on whether the API key is set.
- **Parameters**:
  - `apiKey`: The API key.
- **Return Value**: None

### `updateDefaultPromptStatus(defaultPrompt)`

Updates the default prompt status.

- **Purpose**: Updates the default prompt status.
- **Details**: This function updates the default prompt status in the UI based on whether the default prompt is set.
- **Parameters**:
  - `defaultPrompt`: The default prompt.
- **Return Value**: None
