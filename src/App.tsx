import { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
import SearchResults from './components/SearchResults/SearchResults';
import PlayList from './components/PlayList/PlayList';
import { 
  userAuthentication, getToken, searchTracks, getUserPlaylists,
  getPlaylistTracks, createPlaylist, updatePlaylist
} from './spotify/SpotifyApi';
import PlaylistList from './components/PlaylistList/PlaylistList';

function App() {
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [playlist, setPlaylist] = useState<Playlist>({id: '', name: 'New Playlist'});
  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);

  const verifyUser = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
    const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || '';

    const spotifyAuth = localStorage.getItem('spotify_auth');
    
    // Already authenticated and not expired → done
    if (spotifyAuth) {
      const auth = JSON.parse(spotifyAuth);
      if (auth.expires_at && Date.now() < auth.expires_at) {
        return Promise.resolve(auth.access_token); // ✅ valid token, resolve immediately
      }
      // Token expired → clean up and continue
      localStorage.removeItem('spotify_auth');
    }

    const code = new URLSearchParams(window.location.search).get('code');

    // Have a code → exchange it and WAIT for the result
    if (code) {
      await getToken(code, clientId, redirectUri);
      window.history.replaceState({}, document.title, window.location.pathname);
      return Promise.resolve(JSON.parse(localStorage.getItem('spotify_auth') || '{}').access_token);
    }

    // No auth and no code → redirect to Spotify
    userAuthentication(clientId, redirectUri);
    // This redirect navigates away, but reject so callers don't continue
    return Promise.reject('Redirecting to Spotify for authentication.');
  };

  const search = (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }

    verifyUser().then((token) => {
      return searchTracks(term, token);
    })
    .then(results => {
      setSearchResults(results);
    })
    .catch(error => {
      console.warn(error);
    });
  };
  
  const addTrack = (track: Track) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return; // Already in playlist
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  const removeTrack = (track: Track) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name: string) => {
    setPlaylist(prevPlaylist => ({ ...prevPlaylist, name }));
  };

  const savePlaylist = () => {
    verifyUser().then((token) => {
      const trackUris = playlistTracks.map(track => track.uri);

      if (playlist.id) {
        // Update existing playlist
        updatePlaylist(playlist.id, playlist.name, trackUris, token).then(() => {
          alert('Playlist updated successfully!');
          getCurrentPlaylists(); // Refresh playlist list to reflect changes
        }).catch(error => {
          console.warn(error);
        });
      } else {
        // Create new playlist
        createPlaylist(playlist.name, trackUris, token).then(() => {
          alert('Playlist saved successfully!');
          getCurrentPlaylists(); // Refresh playlist list to include new playlist
        }).catch(error => {
          console.warn(error);
        });
      }

      // Reset after saving
      setPlaylist({ id: '', name: 'New Playlist' });
      setPlaylistTracks([]);
    })
    .catch(error => {
      console.warn(error);
    });
  };

  const getCurrentPlaylists = () => {
    verifyUser().then((token) => {
      getUserPlaylists(token).then(list => {
        setPlaylists(list);

        // Reset selected playlist and tracks when refreshing playlist list
        setPlaylist({ id: '', name: 'New Playlist' });
        setPlaylistTracks([]);
      });
    })
    .catch(error => {
      console.warn(error);
    });
  }

  const selectPlaylist = (playlist: Playlist) => {
    verifyUser().then((token) => {
      getPlaylistTracks(playlist.id, token).then(tracks => {
        setPlaylist(playlist);
        setPlaylistTracks(tracks);
      })
      .catch(error => {
        console.warn(error);
      });
    });
  }

  return (
    <>
      <Header />
      <div className="container">
        <Search onSearch={search} />
        
        <div className="list-content">
          <SearchResults 
            searchResults={searchResults} 
            onAdd={addTrack} 
          />

          <div className="playlist-container">
            <PlayList 
              playlistName={playlist.name}
              playlistTracks={playlistTracks}
              onRemove={removeTrack}
              onNameChange={updatePlaylistName}
              onSave={savePlaylist}
            />

            <PlaylistList
              selectedId={playlist.id}
              playlists={playlists}
              onRefresh={getCurrentPlaylists}
              onSelect={selectPlaylist}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default App
