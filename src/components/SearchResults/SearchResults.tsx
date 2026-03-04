import TrackList from "../TrackList/TrackList";


export default function SearchResults({ searchResults, onAdd }: SearchResultsProps) {
  return (
    <div className="panel">
      <h2>Results</h2>
      <TrackList 
        tracks={searchResults} 
        onAdd={onAdd}
        isRemoval={false} 
      />
    </div>
  );
};