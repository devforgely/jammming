import { generateRandomString, codeChallenge } from './CodeChallenge';
import { validateAndParse } from './ErrorHandler';

export const userAuthentication = async (
    clientId: string,
    redirectUri: string,
    scope: string = "user-read-private user-read-email playlist-modify-private playlist-read-private playlist-read-collaborative",
    authUrl: URL = new URL("https://accounts.spotify.com/authorize")
) => {
    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('code_verifier', codeVerifier);

    const code_challenge = await codeChallenge(codeVerifier);

    const params = {
        response_type: 'code',
        client_id: clientId,
        scope,
        code_challenge_method: 'S256',
        code_challenge,
        redirect_uri: redirectUri,
    };

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}

export const getToken = async (code: string, clientId: string, redirectUri: string) => {
  // stored in the previous step
  const codeVerifier = window.localStorage.getItem('code_verifier');

  if (!codeVerifier) {
    throw new Error('Code verifier not found in localStorage.');
  }

  const url = "https://accounts.spotify.com/api/token";
  const payload = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }).toString(),
  }

  const response = await fetch(url, payload);
  if (response.ok) {
    const jsonResponse = await response.json();

    localStorage.setItem('spotify_auth', JSON.stringify({
      access_token: jsonResponse.access_token,
      expires_at: Date.now() + jsonResponse.expires_in * 1000
    }));
    return;
  }
  return Promise.reject("Failed to exchange code for token");
}

export const searchTracks = async (term: string, token: string) => {
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=track&limit=10`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return validateAndParse(response).then(data => {
      if (data.tracks.items) {
        return data.tracks.items.map((track: Track) => {
          return {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            uri: track.uri
          };
        });
      }
    })
    .catch(error => {
      return Promise.reject(`Failed to search tracks: ${error}`);
    });
}

export const getUserPlaylists = async (token: string) => {
  const url = `https://api.spotify.com/v1/me/playlists`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return validateAndParse(response).then(data => {
    return data.items.map((playlist: Playlist) => ({
      id: playlist.id,
      name: playlist.name
    }));
  })
  .catch(error => {
    return Promise.reject(`Failed to fetch user playlists: ${error}`);
  });
}

export const getPlaylistTracks = async (id: string, token: string) => {
  const url = `https://api.spotify.com/v1/playlists/${id}/items`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return validateAndParse(response).then(data => {
    if (data.items) {
      return data.items.map((wrapper: any) => {
        const track: Track = wrapper.item;
        return {
          id: track.id,
          name: track.name,
          artists: track.artists,
          album: track.album,
          uri: track.uri
        };
      });
    }
  })
  .catch(error => {
    return Promise.reject(`Failed to fetch playlist tracks: ${error}`);
  });
}

const updatePlaylistTracks = async (playlistId: string, trackUris: string[], token: string) => {
  const url = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
  const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body : JSON.stringify({ uris: trackUris })
  });

  return validateAndParse(response).catch(error => {
    return Promise.reject(`Failed to update playlist tracks: ${error}`);
  });
  
}

export const createPlaylist = async (name: string, trackUris: string[], token: string) => {
  const url = `https://api.spotify.com/v1/me/playlists`
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({
      name: name,
      public: false
    })
  });

  return validateAndParse(response).then(data => {
    const playlistId = data.id;
    if (playlistId) {
      return updatePlaylistTracks(playlistId, trackUris, token);
    }
  })
  .catch(error => {
    return Promise.reject(`Failed to create playlist: ${error}`);
  });
}

export const updatePlaylist = async (id: string, name: string, trackUris: string[], token: string) => {
  const url = `https://api.spotify.com/v1/playlists/${id}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name })
  });

  return validateAndParse(response).then(() => {
    return updatePlaylistTracks(id, trackUris, token);
  })
  .catch(error => {
    return Promise.reject(`Failed to update playlist: ${error}`);
  });
}