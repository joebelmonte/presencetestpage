# Presence Test Page

## By Joe Belmonte

Production deployed here: [Presence Test Page](https://glancepro.online/presence.html)

Dev version deployed here: [Presence Dev Test Page](https://glancepro.online/dev/presence-agent/presence.html)

## Release Notes

### November 14, 2021

- Settings are now saved in the browser's local storage and will persist across page refreshes and browser restarts.
  - The exception is the `API Key` which is never stored.
  - Use the `Login Key` to store authentication information.

### November 8, 2021

- Added the option to authenticate via the user entering a login key instead of the group's api key.

### October 31, 2021

- There are now separate buttons for the agent to join with presence versus a session key.
  - Both buttons are always visible, whether there is a presence connection or not.
  - As before, the presence button will light up orange when there is a presence connection.
  - If the agent clicks the presence button when it's blue, they will receive feedback that presence is not currently available.
- `onvisitorsessionstart` event listeners have been optimized to handle situations where the visitor starts a session while connected via presence.
  - The listener is now added only after the agent clicks the `Agent Start` button during a presence connection.
  - The listener is removed...
    - If the visitor declines the terms.
    - Upon receiving the `onvisitorsessionend` event.
    - If the agent cancels the presence invitation by clicking the `presencecancel` button.
- Information about the visitor (URL, browser, OS) is only displayed when available.  Otherwise, those fields are hidden.
- Cleaned up the comments throughout the code.
