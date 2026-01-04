import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom airport marker icon with vibrant gradient
const createAirportIcon = (visitCount) => {
  return L.divIcon({
    className: "custom-airport-marker",
    html: `
      <div style="
        width: 18px;
        height: 18px;
        background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 4px 12px rgba(168, 85, 247, 0.6), 0 0 20px rgba(236, 72, 153, 0.4);
        animation: pulse 2s ease-in-out infinite;
      "></div>
      <style>
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
      </style>
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
};

// Component to adjust map view when data changes
function MapController({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);

  return null;
}

// Component to load and display country polygons
function CountryPolygons({ visits }) {
  const [countryData, setCountryData] = useState({});
  const [allCountriesGeoJSON, setAllCountriesGeoJSON] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load the complete countries GeoJSON file once
  useEffect(() => {
    const loadAllCountries = async () => {
      if (allCountriesGeoJSON) return; // Already loaded

      setLoading(true);
      try {
        const response = await fetch(
          `https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson`
        );
        if (response.ok) {
          const data = await response.json();
          setAllCountriesGeoJSON(data);
        }
      } catch (error) {
        console.error("Failed to load countries GeoJSON:", error);
      }
      setLoading(false);
    };

    loadAllCountries();
  }, []); // Empty dependency array - load only once

  // Process visited countries when GeoJSON is loaded
  useEffect(() => {
    if (!allCountriesGeoJSON || visits.length === 0) return;

    const newData = {};

    visits.forEach((visit) => {
      // Find the country by ISO code
      const countryFeature = allCountriesGeoJSON.features.find(
        (feature) =>
          feature.properties["ISO3166-1-Alpha-3"] ===
            visit.code.toUpperCase() ||
          feature.properties["ISO3166-1-Alpha-2"] === visit.code.toUpperCase()
      );

      if (countryFeature) {
        newData[visit.code] = {
          geoJson: {
            type: "Feature",
            geometry: countryFeature.geometry,
            properties: countryFeature.properties,
          },
          visit: visit,
        };
      } else {
        console.warn(`Country not found for code: ${visit.code}`);
      }
    });

    setCountryData(newData);
  }, [allCountriesGeoJSON, visits]);

  const countryStyle = (feature, visit) => {
    const isTrip = visit.visits.some((v) => v.stayType === "trip");
    const isStay = visit.visits.some((v) => v.stayType === "stay");

    return {
      fillColor: isStay ? "#10b981" : "#f97316", // Green for stays, orange for trips
      fillOpacity: 0.5,
      color: isStay ? "#059669" : "#ea580c", // Darker border
      weight: 3,
      opacity: 0.8,
    };
  };

  const onEachCountry = (feature, layer, visit) => {
    layer.on({
      mouseover: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.7,
          weight: 4,
        });
      },
      mouseout: (e) => {
        const layer = e.target;
        layer.setStyle({
          fillOpacity: 0.5,
          weight: 3,
        });
      },
    });

    // Add popup
    const popupContent = `
      <div class="text-sm">
        <div class="font-bold text-base mb-1">
          ${visit.flag} ${visit.name}
        </div>
        <div class="text-gray-600 text-xs mb-2">${visit.continent}</div>
        <div class="border-t pt-2 mt-2">
          <div class="font-semibold mb-1">
            Visits: ${visit.visitCount}
          </div>
          ${visit.visits
            .map(
              (v, idx) => `
            <div class="text-xs text-gray-600 mt-1">
              <div>
                ${new Date(v.startDate).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
                ${
                  v.endDate
                    ? ` - ${new Date(v.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}`
                    : ""
                }
              </div>
              <div class="text-xs capitalize">
                ${v.stayType}${v.places ? `: ${v.places}` : ""}
              </div>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    layer.bindPopup(popupContent);
  };

  return (
    <>
      {Object.entries(countryData).map(([code, data]) => (
        <GeoJSON
          key={code}
          data={data.geoJson}
          style={(feature) => countryStyle(feature, data.visit)}
          onEachFeature={(feature, layer) =>
            onEachCountry(feature, layer, data.visit)
          }
        />
      ))}
    </>
  );
}

export default function TravelMap({
  flights,
  airports,
  visits,
  viewMode = "both",
}) {
  const [selectedAirport, setSelectedAirport] = useState(null);

  // Process airport data with visit counts
  const airportStats = useMemo(() => {
    const stats = {};

    flights.forEach((flight) => {
      // Track departures
      if (!stats[flight.from]) {
        stats[flight.from] = { departures: [], arrivals: [], total: 0 };
      }
      stats[flight.from].departures.push(flight);
      stats[flight.from].total++;

      // Track arrivals
      if (!stats[flight.to]) {
        stats[flight.to] = { departures: [], arrivals: [], total: 0 };
      }
      stats[flight.to].arrivals.push(flight);
      stats[flight.to].total++;
    });

    return stats;
  }, [flights]);

  // Get unique airports with coordinates
  const airportMarkers = useMemo(() => {
    const markers = [];
    Object.keys(airportStats).forEach((code) => {
      if (airports[code]) {
        markers.push({
          code,
          ...airports[code],
          stats: airportStats[code],
        });
      }
    });
    return markers;
  }, [airportStats, airports]);

  // Get flight paths (polylines)
  const flightPaths = useMemo(() => {
    return flights
      .map((flight, index) => {
        const from = airports[flight.from];
        const to = airports[flight.to];

        if (from && to) {
          return {
            key: `${flight.from}-${flight.to}-${index}`,
            positions: [from.coords, to.coords],
            flight,
          };
        }
        return null;
      })
      .filter(Boolean);
  }, [flights, airports]);

  // Get country markers from visits data
  const countryMarkers = useMemo(() => {
    return visits.map((visit) => ({
      name: visit.name,
      code: visit.code,
      flag: visit.flag,
      continent: visit.continent,
      coords: [visit.coordinates.lat, visit.coordinates.lng],
      visitCount: visit.visits?.length || 0,
      visits: visit.visits || [],
    }));
  }, [visits]);

  // Calculate initial center and zoom
  const mapCenter = useMemo(() => {
    if (airportMarkers.length > 0) {
      const firstAirport = airportMarkers[0];
      return firstAirport.coords;
    } else if (countryMarkers.length > 0) {
      const firstCountry = countryMarkers[0];
      return firstCountry.coords;
    }
    return [20, 0]; // Default world center
  }, [airportMarkers, countryMarkers]);

  const initialZoom = useMemo(() => {
    if (airportMarkers.length > 0 || countryMarkers.length > 0) {
      return 4;
    }
    return 2;
  }, [airportMarkers, countryMarkers]);

  const shouldShowAirports = viewMode === "airports" || viewMode === "both";
  const shouldShowVisits = viewMode === "visits" || viewMode === "both";

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ background: "#0f172a" }}
      >
        <MapController center={mapCenter} zoom={initialZoom} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Country polygons - render first so they're underneath */}
        {shouldShowVisits && <CountryPolygons visits={countryMarkers} />}

        {/* Flight paths with vibrant gradient effect */}
        {shouldShowAirports &&
          flightPaths.map((path) => (
            <Polyline
              key={path.key}
              positions={path.positions}
              pathOptions={{
                color: "#06b6d4",
                weight: 3,
                opacity: 0.8,
                dashArray: "10, 10",
                className: "flight-path-glow",
              }}
            />
          ))}

        {/* Airport markers */}
        {shouldShowAirports &&
          airportMarkers.map((airport) => (
            <Marker
              key={airport.code}
              position={airport.coords}
              icon={createAirportIcon(airport.stats.total)}
              eventHandlers={{
                click: () => setSelectedAirport(airport),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-base mb-1">{airport.city}</div>
                  <div className="text-gray-600 mb-2">{airport.name}</div>
                  <div className="text-xs text-gray-500 mb-1">
                    Code:{" "}
                    <span className="font-mono font-semibold">
                      {airport.code}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="font-semibold mb-1">
                      Total visits: {airport.stats.total}
                    </div>

                    {airport.stats.departures.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-700">
                          Departures:
                        </div>
                        <div className="text-xs space-y-1 mt-1">
                          {airport.stats.departures.map((flight, idx) => (
                            <div key={idx} className="text-gray-600">
                              {flight.tripDate}: {flight.flight} → {flight.to}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {airport.stats.arrivals.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-semibold text-gray-700">
                          Arrivals:
                        </div>
                        <div className="text-xs space-y-1 mt-1">
                          {airport.stats.arrivals.map((flight, idx) => (
                            <div key={idx} className="text-gray-600">
                              {flight.tripDate}: {flight.from} → {flight.flight}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
