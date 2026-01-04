export default function MapControls({ viewMode, onViewModeChange }) {
  const toggleView = (view) => {
    if (viewMode === view) {
      // If clicking the active view, switch to the other one
      onViewModeChange(view === 'airports' ? 'visits' : 'airports');
    } else if (viewMode === 'both') {
      // If both are active, switch to only the other one
      onViewModeChange(view === 'airports' ? 'visits' : 'airports');
    } else {
      // One is active, clicking the other makes both active
      onViewModeChange('both');
    }
  };

  const isAirportsActive = viewMode === 'airports' || viewMode === 'both';
  const isVisitsActive = viewMode === 'visits' || viewMode === 'both';

  return (
    <div className="glass rounded-2xl p-5 shadow-sm">
      <div className="flex gap-2">
        <button
          onClick={() => toggleView('airports')}
          className={`
            flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all
            ${isAirportsActive
              ? 'bg-secondary text-secondary-foreground shadow-sm'
              : 'bg-muted/50 text-foreground hover:bg-muted'
            }
          `}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Airports
          </span>
        </button>
        <button
          onClick={() => toggleView('visits')}
          className={`
            flex-1 px-3 py-2.5 rounded-lg text-xs font-medium transition-all
            ${isVisitsActive
              ? 'bg-accent text-accent-foreground shadow-sm'
              : 'bg-muted/50 text-foreground hover:bg-muted'
            }
          `}
        >
          <span className="inline-flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Visits
          </span>
        </button>
      </div>
    </div>
  );
}
