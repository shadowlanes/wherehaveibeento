const urlParams = new URLSearchParams(window.location.search);
const user = urlParams.get('user') || 'sd';

console.log('Loading data for user:', user);

fetch(`data/${user}.json`)
.then(response => response.json())
.then(trips => {
    console.log('Trips loaded:', trips);
    fetch('data/airports.json')
    .then(response => response.json())
    .then(airports => {
        console.log('Airports loaded:', airports);
        
        // Get first trip's starting airport for initial map view
        let initialCoords = [20, 0];
        let initialZoom = 2;
        if (trips.length > 0 && airports[trips[0].from]) {
            initialCoords = airports[trips[0].from].coords;
            initialZoom = 5;
        }
        
        const map = L.map('map', {
            maxBounds: [[-90, -180], [90, 180]],
            maxBoundsViscosity: 1.0,
            minZoom: 2
        }).setView(initialCoords, initialZoom);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            noWrap: true
        }).addTo(map);

        // Test marker
        // L.marker([0, 0]).addTo(map).bindPopup('Test marker at equator');

        // Add day/night layer
        // L.dayNight().addTo(map);

        // Create custom small icon for airports
        const smallIcon = L.divIcon({
            className: 'custom-marker',
            html: '<div style="background-color: #850554; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [12, 12],
            iconAnchor: [6, 6],
            popupAnchor: [0, -6]
        });

        // Track unique airports and their visits
        const airportVisits = {};
        
        // Plot flights
        trips.forEach(trip => {
            console.log('Plotting trip:', trip);
            const fromData = airports[trip.from];
            const toData = airports[trip.to];
            console.log('From data:', fromData, 'To data:', toData);
            if (fromData && toData) {
                const from = fromData.coords;
                const to = toData.coords;
                
                // Draw flight path
                L.polyline([from, to], {color: '#07669D', weight: 3}).addTo(map);
                
                // Track airport visits
                if (!airportVisits[trip.from]) {
                    airportVisits[trip.from] = [];
                }
                airportVisits[trip.from].push({flight: trip.flight, date: trip.tripDate, type: 'departure'});
                
                if (!airportVisits[trip.to]) {
                    airportVisits[trip.to] = [];
                }
                airportVisits[trip.to].push({flight: trip.flight, date: trip.tripDate, type: 'arrival'});
            }
        });
        
        // Create markers for unique airports with all visits listed
        Object.keys(airportVisits).forEach(airportCode => {
            const airportData = airports[airportCode];
            if (airportData) {
                const visits = airportVisits[airportCode];
                const popupContent = `<strong>${airportData.city}</strong><br>` +
                    `${airportData.name}<br>` +
                    `Visits: ${visits.length}<br>` +
                    visits.map(v => `${v.flight} on ${v.date}`).join('<br>');
                
                L.marker(airportData.coords, {icon: smallIcon})
                    .addTo(map)
                    .bindPopup(popupContent);
            }
        });

        // Add day/night layer
        L.dayNight().addTo(map);
    });
})
.catch(error => console.error('Error loading data:', error));