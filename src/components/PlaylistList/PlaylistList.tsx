import './PlaylistList.css';

export default function PlaylistList({
    selectedId,
    playlists,
    onRefresh,
    onSelect,
}: {
    selectedId: string;
    playlists: Playlist[];
    onRefresh: () => void;
    onSelect: (playlist: Playlist) => void;
}) {
  return (
    <div className="panel">
        <div className="panel-header">
            <h2>Local Playlists</h2>
            <button className="refresh-btn" onClick={() => onRefresh()} aria-label="Refresh Playlists">
                <svg 
                    width="20"
                    height="20"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                >
                <path d="M21 2v6h-6"></path>
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path>
                <path d="M3 22v-6h6"></path>
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path>
                </svg>
            </button>
        </div>

        <div className="playlist-container">
            {playlists.map((playlist: Playlist) => (
            <div 
                key={playlist.id} 
                className={`playlist-card ${selectedId === playlist.id ? 'active' : ''}`}
                onClick={() => onSelect(playlist)}
            >
                <div className="playlist-info">
                <span className="icon">☰</span>
                <span className="name">{playlist.name}</span>
                </div>
            </div>
            ))}
        </div>
    </div>
  );
}
