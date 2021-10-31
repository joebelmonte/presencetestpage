# Presence Test Page

## By Joe Belmonte

Production deployed here: [Presence Test Page](https://glancepro.online/presence.html)

Dev version deployed here: [Presence Dev Test Page](https://glancepro.online/dev/presence-agent/presence.html)

## Release Notes

### October 31, 2021

- There are now separate buttons for the agent to join with presence versus a session key
  - Both buttons are always visible, whether there is a presence connection or not
  - As before, the presence button will light up orange when there is a presence connection
  - If the agent clicks the presence button when it's blue, they will receive feedback that presence is not currently available.
- `onvisitorsessionstart` event listeners have been optimized to handle situations where the visitor starts a session while connected via presence
  - The listener is now added only after the agent clicks the `agent start` button during a presence connection.
  - The listener is removed if the visitor declines the terms and conditions and after a presence-initiated session has completed.
- Information about the visitor (URL, browser, OS) is only displayed when available.  Otherwise, those fields are hidden.
- Cleaned up the comments throughout the code.
