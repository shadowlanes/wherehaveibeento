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
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary border-r-4 border-r-accent mx-auto glow-animation"></div>
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            ✈️ Loading your adventures for {username}...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl border-4 border-destructive">
            <div className="text-destructive mb-4 text-6xl">❌</div>
            <h3 className="text-2xl font-bold mb-3 text-destructive">Oops! Something went wrong</h3>
            <p className="text-lg text-gray-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const hasData = flights.length > 0 || visits.length > 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <nav className="bg-white/90 backdrop-blur-md shadow-xl border-b-4 border-primary sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="float-animation">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                🌍 Where Have I Been To? ✈️
              </h1>
              <p className="text-lg text-gray-700 mt-1 font-semibold">
                Exploring the world as:{' '}
                <span className="px-3 py-1 bg-gradient-to-r from-primary to-accent text-white rounded-full font-bold shadow-lg">
                  {username}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-secondary to-primary text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                {flights.length} flights ✈️ • {visits.length} countries 🌏
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasData ? (
          <div className="bg-white/95 backdrop-blur-md rounded-3xl border-4 border-dashed border-primary p-12 shadow-2xl">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-8xl mb-6 float-animation">🗺️</div>
              <h3 className="text-3xl font-bold mb-3 text-primary">No Adventures Found!</h3>
              <p className="text-xl text-gray-700 text-center max-w-sm">
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
              <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-accent">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl">📊</span>
                  <h3 className="text-xl font-bold text-accent">Travel Stats</h3>
                </div>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
                    <span className="font-semibold text-gray-700">✈️ Total Flights</span>
                    <span className="font-bold text-2xl text-primary">{flights.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-xl">
                    <span className="font-semibold text-gray-700">🛫 Airports</span>
                    <span className="font-bold text-2xl text-secondary">{uniqueAirports}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gradient-to-r from-accent/10 to-accent/5 rounded-xl">
                    <span className="font-semibold text-gray-700">🌍 Countries</span>
                    <span className="font-bold text-2xl text-accent">{uniqueCountries}</span>
                  </div>
                </div>

                {/* Fun badges */}
                <div className="mt-6 pt-6 border-t-2 border-accent/30">
                  <h4 className="font-bold text-sm text-gray-600 mb-3">🏆 Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {uniqueCountries >= 10 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-full shadow">
                        🌟 Globe Trotter
                      </span>
                    )}
                    {flights.length >= 20 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold rounded-full shadow">
                        ✈️ Frequent Flyer
                      </span>
                    )}
                    {uniqueAirports >= 15 && (
                      <span className="px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow">
                        🗺️ Airport Pro
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3">
              <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden h-[700px] border-4 border-secondary">
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

      {/* Fun footer */}
      <footer className="text-center py-8 text-white">
        <p className="text-lg font-bold drop-shadow-lg">
          🌈 Adventure awaits! Keep exploring! 🎒
        </p>
      </footer>
    </div>
  );
}

export default App;
