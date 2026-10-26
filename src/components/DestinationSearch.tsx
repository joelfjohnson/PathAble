import { useId } from "react";
import { MapPin, Search } from "lucide-react";

export default function DestinationSearch({
  origin,
  destination,
  onOrigin,
  onDestination,
  onSearch,
}: {
  origin: string;
  destination: string;
  onOrigin: (text: string) => void;
  onDestination: (text: string) => void;
  onSearch: () => void;
}) {
  const id = useId();
  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onSearch();
    }
  };

  return (
    <div className="destination-search">
      <div className="search-section-label">
        <Search size={14} /> YOUR JOURNEY, AHEAD
      </div>
      <div className="location-fields">
        <label className="location-entry" htmlFor={`${id}-origin`}>
          <MapPin size={18} aria-hidden="true" />
          <span className="sr-only">Your location</span>
          <div>
            <small>YOUR LOCATION</small>
            <input
              id={`${id}-origin`}
              aria-label="Your location"
              placeholder="Enter a starting point"
              value={origin}
              onChange={(event) => onOrigin(event.target.value)}
              onKeyDown={handleEnter}
            />
          </div>
        </label>
        <label className="location-entry" htmlFor={`${id}-destination`}>
          <MapPin size={18} aria-hidden="true" />
          <span className="sr-only">Destination</span>
          <div>
            <small>DESTINATION</small>
            <input
              id={`${id}-destination`}
              aria-label="Destination"
              placeholder="Enter a destination"
              value={destination}
              onChange={(event) => onDestination(event.target.value)}
              onKeyDown={handleEnter}
            />
          </div>
        </label>
      </div>
    </div>
  );
}
