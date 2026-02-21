import Track from "../Track/Track";
import './TrackList.css';


export default function TrackList({ tracks, onAdd = () => {}, onRemove = () => {}, isRemoval }: TrackListProps) {
  return (
    <div className="track-list">
      {tracks.map(track => (
        <Track 
          key={track.id}
          track={track} 
          onAdd={onAdd} 
          onRemove={onRemove} 
          isRemoval={isRemoval} 
        />
      ))}
    </div>
  );
};