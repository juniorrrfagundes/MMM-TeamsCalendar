# MMM-TeamsCalendar

The `MMM-TeamsCalendar` module is designed to display Microsoft Teams calendar events in a MagicMirror application. It integrates with the Microsoft Graph API to fetch and display work meetings.

## Overview

This module consists of several components:

1. **Node.js Helper (`node_helper.js`)**: Fetches calendar data from Microsoft Graph API and processes it.
2. **MagicMirror Module (`MMM-TeamsCalendar.js`)**: Displays the processed calendar data in the MagicMirror interface.

## Node.js Helper

The Node.js helper script (`node_helper.js`) is responsible for handling authentication and fetching calendar data from Microsoft Graph API using Puppeteer for browser automation.

### Key Functions

- **`generateCodeVerifier()`**: Generates a PKCE code verifier.
- **`generateCodeChallenge()`**: Generates a PKCE code challenge based on the verifier.
- **`fetchData()`**: Fetches calendar data from Microsoft Graph API.
- **`openNavigator()`**: Opens a browser session to handle authentication and obtain an access token.
- **`manageData()`**: Processes and formats calendar data.
- **`separateByWeekday()`**: Groups events by weekday and sorts them.
- **`getDayName()`**: Returns the name of the day for a given date.
- **`formatDate()`**: Formats date and time for display.

### Usage

1. Configure the MSAL settings with your Azure application details.
2. Start the Node.js helper to handle authentication and data fetching.

## MagicMirror Module

The MagicMirror module script (`MMM-TeamsCalendar.js`) is responsible for rendering the calendar data within the MagicMirror interface.

### Key Functions

- **`getStyles()`**: Returns the CSS file for styling.
- **`start()`**: Initializes the module, sends an initial message, and schedules updates.
- **`getDom()`**: Constructs and returns the DOM for displaying calendar events.
- **`sendMessage()`**: Sends a notification to the Node.js helper.
- **`socketNotificationReceived()`**: Receives data from the Node.js helper and updates the DOM.
- **`formatPayload()`**: Formats the received data for display.
- **`scheduleUpdate()`**: Schedules periodic updates to fetch new data.

### Usage

1. Add the module to your MagicMirror configuration file.
2. Ensure that the Node.js helper is running and properly configured.
3. The module will automatically fetch and display work meetings.

## Installation

1. Clone the repository to your MagicMirror modules directory:
    ```bash
    git clone https://github.com/your-username/MMM-TeamsCalendar.git
    ```
2. Install the necessary dependencies:
    ```bash
    cd MMM-TeamsCalendar
    npm install
    ```
3. Add the module to your MagicMirror configuration file (`config/config.js`):
    ```javascript
    {
        module: "MMM-TeamsCalendar",
        position: "top_right",
        config: {
            updateInterval: 600000 // Update every 10 minutes
        }
    }
    ```

## Notes

- Repository URL: https://github.com/juniorrrfagundes/MMM-TeamsCalendar
- Author: Junior Rafael Fagundes https://github.com/juniorrrfagundes
