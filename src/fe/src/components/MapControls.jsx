export default function MapControls({ viewMode, onViewModeChange, airportCount, visitCount }) {
  const modes = [
    { value: 'both', label: 'Both', icon: '🗺️' },
    { value: 'airports', label: 'Airports', icon: '✈️' },
    { value: 'visits', label: 'Visits', icon: '📍' },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold mb-3">View Mode</h3>
          <div className="flex gap-2">
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`
                  flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all
                  ${viewMode === mode.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
              >
                <span className="mr-2">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-500 border-2 border-white"></div>
            <span className="text-muted-foreground">
              Airports: <span className="font-semibold text-foreground">{airportCount}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-white"></div>
            <span className="text-muted-foreground">
              Countries: <span className="font-semibold text-foreground">{visitCount}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
