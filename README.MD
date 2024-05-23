# Presence Test Page

## By Joe Belmonte

Production deployed here: [Presence Test Page](https://glancepro.online/presence.html)

Dev version deployed here: [Presence Dev Test Page](https://glancepro.online/dev/presence-agent/presence.html)

## Known Issues

- Cannot initiate sessions when the visitor is on a mobile device (CS-954)

## Release Notes

### May 23, 2024

- Improved compatibility with load balanced presence servers.

### March 31, 2022

- Fixed bug with authentication.
  - There was a bug where the `onsuccess` method of `GLANCE.Authorization.authorize` was adding older login key values back into local storage. This sometimes caused authentication problems on subsequent page loads.
- Increased the width of the authentication input field so you can see an entire login key value.

### February 26, 2022

- Improvements to authentication
  - When authenticating with an `API Key`, the page will automatically store and use the subsequently generated login key for authentication after page refresh. Since the login key can be stored in local storage, this eliminates the need for the user to manually paste the API Key on each page load.
  - The `duration` field only shows up when authenticating with the API Key. If authenticating with the login key, the duration is determined by the expiration value built into the login key.
- Removed the `onvisitorsessionstart` when the agent joins the session.
  - This is to guard against a scenario where the agent joins a presence-initiated session, the visitor navigates to a non-presence page and ends the session (resulting in the `onvisitorsessionend` event not firing), then navigates back to presence-enabled page and starts a random key session. Previously this sequence would result in the page automatically attempting to join a session with the visitor ID as the key because on `onvisitorsessionstart` event was added and never removed.

### January 30, 2022

- Group ID, Partner User ID, and Visitor ID settings are now persistently displayed after the user clicks `Submit`.

### November 14, 2021

- Settings are now saved in the browser's local storage and will persist across page refreshes and browser restarts.
  - The exception is the `API Key` which is never stored.
  - Use the `Login Key` to store authentication information.

### November 8, 2021

- Added the option to authenticate via the user entering a login key instead of the group's API Key.

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
    - Note: the Feb 2022 release also removed the listener as the agent attempts to join the session.
- Information about the visitor (URL, browser, OS) is only displayed when available. Otherwise, those fields are hidden.
- Cleaned up the comments throughout the code.
