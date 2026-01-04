import { useState } from 'react';
import TravelMap from './components/TravelMap';
import MapControls from './components/MapControls';
import { useUserData, useUsername } from './hooks/useUserData';

function App() {
  const username = useUsername('sd');
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-6">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-r-4 border-r-transparent mx-auto opacity-80"></div>
          <p className="text-xl font-medium text-foreground/80">
            Loading your adventures for {username}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4">
          <div className="glass rounded-2xl p-8 text-center shadow-lg">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = flights.length > 0 || visits.length > 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="glass sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Where Have I Been To?
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Exploring the world as{' '}
                <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-lg font-semibold">
                  {username}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-border shadow-sm">
                <span className="text-sm font-semibold text-foreground">{flights.length}</span>
                <span className="text-xs text-muted-foreground ml-1">flights</span>
              </div>
              <div className="px-4 py-2 bg-white/60 backdrop-blur-sm rounded-xl border border-border shadow-sm">
                <span className="text-sm font-semibold text-foreground">{visits.length}</span>
                <span className="text-xs text-muted-foreground ml-1">countries</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          <div className="glass rounded-2xl p-12 shadow-sm border-2 border-dashed border-border">
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-2 text-foreground">No Adventures Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                No travel data available for user "{username}". Try a different explorer with ?user=username
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Controls Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <MapControls
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                airportCount={uniqueAirports}
                visitCount={uniqueCountries}
              />

              {/* Stats Card */}
              <div className="glass rounded-2xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-foreground mb-4">Travel Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary/5 rounded-xl border border-primary/10">
                    <span className="text-sm font-medium text-foreground">Total Flights</span>
                    <span className="font-semibold text-xl text-primary">{flights.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/5 rounded-xl border border-secondary/10">
                    <span className="text-sm font-medium text-foreground">Airports</span>
                    <span className="font-semibold text-xl text-secondary">{uniqueAirports}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/5 rounded-xl border border-accent/10">
                    <span className="text-sm font-medium text-foreground">Countries</span>
                    <span className="font-semibold text-xl text-accent">{uniqueCountries}</span>
                  </div>
                </div>

                {/* Achievements */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCountries >= 10 && (
                      <span className="px-3 py-1.5 bg-secondary/10 text-secondary text-xs font-medium rounded-lg border border-secondary/20">
                        Globe Trotter
                      </span>
                    )}
                    {flights.length >= 20 && (
                      <span className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-medium rounded-lg border border-primary/20">
                        Frequent Flyer
                      </span>
                    )}
                    {uniqueAirports >= 15 && (
                      <span className="px-3 py-1.5 bg-accent/10 text-accent text-xs font-medium rounded-lg border border-accent/20">
                        Airport Pro
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="glass rounded-2xl shadow-sm overflow-hidden h-[700px] border border-border">
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

      {/* Footer */}
      <footer className="text-center py-8">
        <p className="text-sm text-muted-foreground font-medium">
          Adventure awaits. Keep exploring.
        </p>
      </footer>
    </div>
  );
}

export default App;
