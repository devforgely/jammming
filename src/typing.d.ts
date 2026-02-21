type Song = {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
}

type SearchProps = {
  onSearch: (term: string) => void;
}

type TrackProps = {
  track: Song;
  onAdd: (track: Song) => void;
  onRemove: (track: Song) => void;
  isRemoval: boolean;
}

type TrackListProps = {
  tracks: Song[];
  onAdd?: (track: Song) => void;
  onRemove?: (track: Song) => void;
  isRemoval: boolean;
};

type SearchResultsProps = {
  searchResults: Song[];
  onAdd: (track: Song) => void;
};

type PlaylistProps = {
  playlistName: string;
  playlistTracks: Song[];
  onRemove: (track: Song) => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
}