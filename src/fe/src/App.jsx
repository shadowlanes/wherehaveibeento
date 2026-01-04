import { useState } from 'react';
import TravelMap from './components/TravelMap';
import MapControls from './components/MapControls';
import { useUserData, useUsername } from './hooks/useUserData';

function App() {
  const username = useUsername('sd'); // Default to 'sd'
  const { flights, airports, visits, loading, error } = useUserData(username);
  const [viewMode, setViewMode] = useState('both');

  // Calculate stats
  const uniqueAirports = Object.keys(
    flights.reduce((acc, flight) => {
      acc[flight.from] = true;
      acc[flight.to] = true;
      return acc;
    }, {})
  ).length;

  const uniqueCountries = visits.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading travel data for {username}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="max-w-md w-full mx-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
            <div className="text-destructive mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = flights.length > 0 || visits.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">Where Have I Been To</h1>
              <p className="text-sm text-muted-foreground">
                Viewing data for: <span className="font-semibold text-foreground">{username}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {flights.length} flights • {visits.length} countries
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!hasData ? (
          <div className="bg-card rounded-xl border border-border p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-muted-foreground mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18" />
                  <path d="M9 21V9" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">No Travel Data Found</h3>
              <p className="text-muted-foreground text-center max-w-sm">
                No travel data available for user "{username}". Try a different user with ?user=username
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls Sidebar */}
            <div className="lg:col-span-1">
              <MapControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                airportCount={uniqueAirports}
                visitCount={uniqueCountries}
              />

              {/* Stats Card */}
              <div className="bg-card border border-border rounded-lg p-4 shadow-sm mt-4">
                <h3 className="text-sm font-semibold mb-3">Travel Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Flights</span>
                    <span className="font-semibold">{flights.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Unique Airports</span>
                    <span className="font-semibold">{uniqueAirports}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Countries Visited</span>
                    <span className="font-semibold">{uniqueCountries}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden h-[600px]">
                <TravelMap
                  flights={flights}
                  airports={airports}
                  visits={visits}
                  viewMode={viewMode}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
