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
        const map = L.map('map').setView([40, -100], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Test marker
        // L.marker([0, 0]).addTo(map).bindPopup('Test marker at equator');

        // Add day/night layer
        // L.dayNight().addTo(map);

        // Plot flights
        trips.forEach(trip => {
            console.log('Plotting trip:', trip);
            const fromData = airports[trip.from];
            const toData = airports[trip.to];
            console.log('From data:', fromData, 'To data:', toData);
            if (fromData && toData) {
                const from = fromData.coords;
                const to = toData.coords;
                L.polyline([from, to], {color: 'blue', weight: 3}).addTo(map);
                L.marker(from).addTo(map).bindPopup(`${fromData.name}\nFlight: ${trip.flight} on ${trip.tripDate}`);
                L.marker(to).addTo(map).bindPopup(`${toData.name}\nFlight: ${trip.flight} on ${trip.tripDate}`);
            }
        });

        // Add day/night layer
        L.dayNight().addTo(map);
    });
})
.catch(error => console.error('Error loading data:', error));