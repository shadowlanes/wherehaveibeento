export default function MapControls({ viewMode, onViewModeChange, airportCount, visitCount }) {
  const modes = [
    { value: 'both', label: 'Both', icon: '🗺️', gradient: 'from-purple-500 to-pink-500' },
    { value: 'airports', label: 'Airports', icon: '✈️', gradient: 'from-blue-500 to-cyan-500' },
    { value: 'visits', label: 'Visits', icon: '📍', gradient: 'from-orange-500 to-red-500' },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border-4 border-primary">
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl">🎨</span>
            <h3 className="text-xl font-bold text-primary">View Mode</h3>
          </div>
          <div className="flex flex-col gap-3">
            {modes.map(mode => (
              <button
                key={mode.value}
                onClick={() => onViewModeChange(mode.value)}
                className={`
                  px-6 py-4 rounded-2xl text-base font-bold transition-all transform hover:scale-105
                  ${viewMode === mode.value
                    ? `bg-gradient-to-r ${mode.gradient} text-white shadow-2xl border-4 border-white`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-4 border-transparent'
                  }
                `}
              >
                <span className="text-2xl mr-2">{mode.icon}</span>
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t-4 border-primary/30">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔢</span>
            <h4 className="font-bold text-gray-700">Legend</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-4 border-white shadow-lg"></div>
              <span className="text-gray-700 font-semibold">
                Airports: <span className="font-bold text-purple-600 text-xl">{airportCount}</span>
              </span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-orange-500 to-red-500 border-4 border-white shadow-lg"></div>
              <span className="text-gray-700 font-semibold">
                Countries: <span className="font-bold text-orange-600 text-xl">{visitCount}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Fun tip */}
        <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-2xl p-4 border-4 border-yellow-400">
          <div className="flex items-start gap-2">
            <span className="text-2xl">💡</span>
            <p className="text-sm font-semibold text-gray-700">
              Click on markers to see detailed travel info!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
