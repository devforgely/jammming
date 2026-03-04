## Feature Request: Multiple Playlists

### Objective

Enable users to update and save all their Spotify playlists directly within the Jammming application.

---

### Background

Jammming currently supports creating only one new playlist at a time, with no ability to edit existing playlists. Given that over 5 million playlists are created or edited daily on Spotify, this feature is essential to enhance user functionality and align with common usage patterns.

---

### Key Features

- **Display User Playlists:** Show a list of the current user's Spotify playlists.
- **Select and Load Playlists:** Allow users to choose an existing playlist, loading its name and tracks into the playlist panel for editing.
- **Update and Save:** Enable modifications to the playlist name and/or tracks, with a `SAVE PLAYLIST` option to persist changes to Spotify.
- **Handle Unsaved Changes:** If a user switches playlists with unsaved changes, the application discards those changes and reloads the original Spotify version when returning to the playlist.

---

### Technical Design

#### Retrieve and Display Playlists

- **New Component:** Create a `PlaylistList` component to fetch and display playlists.
- **State Management:** Initialize state with an empty array for playlists.
- **API Integration:**
  - Develop `getUserPlaylists()` to fetch playlists via `/v1/me/playlists`, storing objects with `playlistId` and `name`.
- **Rendering:** Render `PlaylistList` components for the fetched playlist, passing down ID and name.
- **Integration:** Add `PlaylistList` to the main `App` component.

#### Select Playlists

- **Method in App:** Add `selectPlaylist(playlist)` in `App.js` to handle selection.
- **API Method:** Implement `getPlaylistTracks(id, token)` to fetch tracks via `/v1//playlists/{id}/items`.
- **State Update:** On resolving the API call, update `playlistName` and `playlistTracks` in App's state.
- **Event Handling:** Bind `selectPlaylist` and pass it to `PlaylistList` components for `onClick` events.

#### Save Playlists

- **State Addition:** Add `playlist` to App's state, initialized to empty.
- **Method Modification:** Update `savePlaylist()` so that it can update existing playlist.
- **Conditional Logic:**
  - If an ID is provided, update the existing playlist name via `/v1/playlists/{id}`.
  - If no ID, create a new playlist as before.
- **State Cleanup:** Reset `playlist` to `empty` after saving.

---

### Caveats

#### Asynchronous Existing Playlist Save Requests

Saving existing playlists could be optimized by sending simultaneous requests for name and track updates. However, this complicates the code without enhancing user experience, as users can interact during saves. Thus, this optimization is deferred to maintain code simplicity.

#### Excess Playlist Saves

The application saves playlists on every `SAVE PLAYLIST` click, regardless of changes, potentially causing unnecessary API calls. Since this doesn't impact user experience, it is considered a premature optimization. It will be addressed only if API throttling or abuse becomes an issue.