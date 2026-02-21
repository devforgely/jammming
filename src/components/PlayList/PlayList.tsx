import TrackList from "../TrackList/TrackList";
import './PlayList.css';

export default function Playlist({ playlistName, playlistTracks, onRemove, onNameChange, onSave }: PlaylistProps) {
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onNameChange(event.target.value);
  };

  return (
    <div className="panel playlist">
      <input 
        className="playlist-input" 
        value={playlistName} 
        onChange={handleNameChange} 
        placeholder="New Playlist"
      />
      <TrackList 
        tracks={playlistTracks}
        onRemove={onRemove}
        isRemoval={true} />
      <button className="save-btn" onClick={onSave}>SAVE TO SPOTIFY</button>
    </div>
  );
};