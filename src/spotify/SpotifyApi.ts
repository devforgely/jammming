import { generateRandomString, codeChallenge } from './CodeChallenge';

export const userAuthentication = async (
    clientId: string,
    redirectUri: string,
    scope: string = "",
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
  const codeVerifier = localStorage.getItem('code_verifier');

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

  const body = await fetch(url, payload);
  const response = await body.json();
  if (response.ok) {
    const refresh_token = response.refresh_token;

    localStorage.setItem('spotify_auth', JSON.stringify({
      access_token: response.access_token,
      refresh_token: refresh_token,
      expires_at: Date.now() + response.expires_in * 1000
    }));
  }
}

export const refreshToken = async (refreshToken: string, clientId: string) => {
    const payload = {
        method: 'POST',
        headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: clientId
        }),
    }
    const body = await fetch("https://accounts.spotify.com/api/token", payload);
    const response = await body.json();

    localStorage.setItem("spotify_auth", JSON.stringify({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_at: Date.now() + response.expires_in * 1000,
    }));
};

const handleResponseErrors = (response: Response) => {
  if (response.status === 401) {
    alert("Unauthorized (401): Access token is invalid or expired.");
  }
  else if (response.status === 403) {
    alert("Forbidden (403): You do not have permission to access this resource.");
  }
  else if (response.status === 429) {
    alert("Too Many Requests (429): You have exceeded the rate limit. Please try again later.");
  }
}

export const searchTracks = async (term: string, token: string) => {
    const url = `https://api.spotify.com/v1/search?q=${term}&type=track`;

    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    handleResponseErrors(response);
    if (response.ok) {
      const jsonResponse = await response.json();
      if (jsonResponse.tracks.items) {
        return jsonResponse.tracks.items.map((track: Track) => {
          return {
            id: track.id,
            name: track.name,
            artists: track.artists,
            albums: track.albums,
            url: track.uri
          };
        });
      }
    }
    return [];
}

export const createPlaylist = async (name: string, trackUris: string[], token: string) => {
  if (Array.isArray(trackUris) && trackUris.length) {
    const createPlaylistUrl = `https://api.spotify.com/v1/me/playlists`
    const response = await fetch(createPlaylistUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body : JSON.stringify({
        name: name,
        public: true
      })
    });

    handleResponseErrors(response);
    if (response.ok) {
      const jsonResponse = await response.json();
      const playlistId = jsonResponse.id;
      
      if (playlistId) {
        const addPlaylistitemsUrl = `https://api.spotify.com/v1/playlists/${playlistId}/items`;
        const addResponse = await fetch(addPlaylistitemsUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body : JSON.stringify({uris: trackUris, position: 0})
        });
        handleResponseErrors(addResponse);
      }
    }
  }
}