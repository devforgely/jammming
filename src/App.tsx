import { useState } from 'react';
import './App.css';
import Header from './components/Header/Header';
import Search from './components/Search/Search';
import SearchResults from './components/SearchResults/SearchResults';
import PlayList from './components/PlayList/PlayList';

function App() {
  const initialSearchResults = [
  { id: '1', name: 'Xe3', artist: 'Mssingno', album: 'MssingNo EP', uri: 'spotify:track:1' },
  { id: '2', name: 'Fones', artist: 'Mssingno', album: 'Fones', uri: 'spotify:track:2' },
  { id: '3', name: 'Brandy Flip', artist: 'Mssingno', album: 'MssingNo EP', uri: 'spotify:track:3' },
  { id: '4', name: 'Skepta Interlude', artist: 'Mssingno', album: 'MssingNo EP', uri: 'spotify:track:4' },
  { id: '5', name: 'Inta', artist: 'Mssingno', album: 'MssingNo EP', uri: 'spotify:track:5' },
];

  const [searchResults, setSearchResults] = useState<Song[]>(initialSearchResults);
  const [playlistName, setPlaylistName] = useState<string>('New Playlist');
  const [playlistTracks, setPlaylistTracks] = useState<Song[]>([]);

  const search = (term: string) => {
    if (!term) {
      setSearchResults([]);
      return;
    }
    // TODO: implement search functionality using Spotify API
    const results: Song[] = []; // Replace with actual search results from Spotify API
    setSearchResults(results);
  };

  const addTrack = (track: Song) => {
    if (playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
      return; // Already in playlist
    }
    setPlaylistTracks([...playlistTracks, track]);
  };

  const removeTrack = (track: Song) => {
    setPlaylistTracks(playlistTracks.filter(savedTrack => savedTrack.id !== track.id));
  };

  const updatePlaylistName = (name: string) => {
    setPlaylistName(name);
  };

  const savePlaylist = () => {
    // In a real app, this would use the Spotify API
    const trackURIs = playlistTracks.map(track => `spotify:track:${track.id}`);
    alert(`Mock Save: Saving playlist "${playlistName}" with ${trackURIs.length} tracks to Spotify!`);
    
    // Reset after saving
    setPlaylistName('New Playlist');
    setPlaylistTracks([]);
  };

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

          <PlayList 
            playlistName={playlistName}
            playlistTracks={playlistTracks}
            onRemove={removeTrack}
            onNameChange={updatePlaylistName}
            onSave={savePlaylist}
          />
        </div>
      </div>
    </>
  )
}

export default App
