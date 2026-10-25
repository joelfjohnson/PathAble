import { useEffect, useId, useRef, useState } from "react";
import { MapPin, ArrowUpRight, CheckCircle2, X, Search } from "lucide-react";
export default function DestinationSearch({
  origin,
  destination,
  onOrigin,
  onDestination,
  onSearch,
  onFeatured,
  error,
}: {
  origin: string;
  destination: string;
  onOrigin: (text: string) => void;
  onDestination: (text: string) => void;
  onSearch: () => void;
  onFeatured: () => void;
  error: string;
}) {
  const [active, setActive] = useState<"origin" | "destination" | null>(null),
    [highlighted, setHighlighted] = useState(false);
  const root = useRef<HTMLDivElement>(null),
    destinationInput = useRef<HTMLInputElement>(null),
    originInput = useRef<HTMLInputElement>(null);
  const id = useId().replaceAll(":", "");
  const supported =
    destination.trim().toLowerCase() === "bentonville city square";
  const unsupported = destination.trim() && !supported;
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setActive(null);
        setHighlighted(false);
      }
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  const select = () => {
    if (active === "origin") onOrigin("Downtown transit pickup");
    else onDestination("Bentonville City Square");
    setActive(null);
    setHighlighted(false);
  };
  const keyboard = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(
        event.currentTarget === originInput.current ? "origin" : "destination",
      );
      setHighlighted(true);
    } else if (event.key === "Escape") {
      setActive(null);
      setHighlighted(false);
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active && highlighted) select();
      else {
        setActive(null);
        onSearch();
      }
    }
  };
  return (
    <div ref={root} className="destination-search">
      <div className="search-section-label">
        <Search size={14} /> YOUR JOURNEY, AHEAD
      </div>
      <div
        className={
          "location-fields " + (supported ? "destination-supported" : "")
        }
      >
        <label>
          <span className="location-dot" />
          <div>
            <small>STARTING POINT</small>
            <input
              ref={originInput}
              role="combobox"
              aria-label="Starting point"
              aria-autocomplete="list"
              aria-expanded={active === "origin"}
              aria-controls={
                active === "origin" ? `suggestions-${id}` : undefined
              }
              aria-activedescendant={
                active === "origin" && highlighted
                  ? `suggestion-${id}`
                  : undefined
              }
              value={origin}
              onFocus={() => {
                setActive("origin");
                setHighlighted(false);
              }}
              onChange={(e) => {
                onOrigin(e.target.value);
                setActive("origin");
                setHighlighted(false);
              }}
              onKeyDown={keyboard}
            />
          </div>
        </label>
        <span className="location-connector" />
        <label>
          <MapPin size={19} />
          <div>
            <small>DESTINATION</small>
            <input
              ref={destinationInput}
              role="combobox"
              aria-label="Destination"
              aria-autocomplete="list"
              aria-expanded={active === "destination"}
              aria-controls={
                active === "destination" ? `suggestions-${id}` : undefined
              }
              aria-activedescendant={
                active === "destination" && highlighted
                  ? `suggestion-${id}`
                  : undefined
              }
              value={destination}
              onFocus={() => {
                setActive("destination");
                setHighlighted(false);
              }}
              onChange={(e) => {
                onDestination(e.target.value);
                setActive("destination");
                setHighlighted(false);
              }}
              onKeyDown={keyboard}
            />
          </div>
          {supported ? (
            <CheckCircle2 size={17} className="destination-check" />
          ) : (
            destination && (
              <button
                className="clear-destination"
                aria-label="Clear destination"
                type="button"
                onClick={() => {
                  onDestination("");
                  destinationInput.current?.focus();
                }}
              >
                <X size={15} />
              </button>
            )
          )}
        </label>
      </div>
      {supported && (
        <div className="destination-selected">
          <span className="live-dot" /> Featured destination selected
        </div>
      )}
      {active && (
        <div className="suggestion-popover">
          <span className="suggestion-heading">
            EXPLORE THE FEATURED JOURNEY
          </span>
          <div
            id={`suggestions-${id}`}
            role="listbox"
            aria-label="Featured location suggestions"
          >
            <button
              id={`suggestion-${id}`}
              role="option"
              aria-selected={highlighted}
              tabIndex={-1}
              className={
                "search-suggestion " + (highlighted ? "is-highlighted" : "")
              }
              onPointerDown={(e) => e.preventDefault()}
              onClick={select}
            >
              <span className="round-icon">
                <MapPin size={18} />
              </span>
              <span>
                {active === "origin"
                  ? "Downtown transit pickup"
                  : "Bentonville City Square"}
                <small>
                  {active === "origin"
                    ? "Simulated pickup point"
                    : "Featured destination"}{" "}
                  · Bentonville, AR
                </small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          </div>
        </div>
      )}
      {(unsupported || error) && (
        <div className="unsupported-search">
          <span className="pill">ONE JOURNEY. A WORLD OF POSSIBILITY.</span>
          <p>
            {error ||
              "Your search stays here. Route previews are currently available for our featured Bentonville journey."}
          </p>
          {error && (
            <span className="sr-only" role="alert">
              {error}
            </span>
          )}
          <button
            className="text-link"
            onClick={() => {
              onFeatured();
              setActive(null);
            }}
          >
            Explore PathAble's featured Bentonville journey{" "}
            <ArrowUpRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
