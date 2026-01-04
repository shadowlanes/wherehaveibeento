export default function MapControls({ viewMode, onViewModeChange, airportCount, visitCount }) {
  const modes = [
    { value: 'both', label: 'Both', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    )},
    { value: 'airports', label: 'Airports', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )},
    { value: 'visits', label: 'Visits', icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )},
  ];

  return (
    <div className="glass rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-3">View Mode</h3>
          <div className="flex flex-col gap-2">
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`
                  px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${viewMode === mode.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-foreground hover:bg-muted'
                  }
                `}
              >
                <span className="inline-flex items-center gap-2">
                  {mode.icon}
                  {mode.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-border">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Legend</h4>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary border-2 border-white shadow-sm"></div>
              <span className="text-xs text-foreground">
                Airports <span className="font-semibold text-secondary ml-1">{airportCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-accent border-2 border-white shadow-sm"></div>
              <span className="text-xs text-foreground">
                Countries <span className="font-semibold text-accent ml-1">{visitCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="bg-primary/5 rounded-xl p-3.5 border border-primary/10">
          <div className="flex items-start gap-2.5">
            <svg className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-xs font-medium text-foreground/80">
              Click on markers to see detailed travel info
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
