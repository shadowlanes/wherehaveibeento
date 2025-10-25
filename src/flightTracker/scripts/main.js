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
            const from = airports[trip.from];
            const to = airports[trip.to];
            console.log('From coords:', from, 'To coords:', to);
            if (from && to) {
                L.polyline([from, to], {color: 'blue', weight: 3}).addTo(map);
                L.marker(from).addTo(map).bindPopup(`${trip.flight} on ${trip.tripDate}`);
                L.marker(to).addTo(map).bindPopup(`${trip.flight} on ${trip.tripDate}`);
            }
        });

        // Add day/night layer
        L.dayNight().addTo(map);
    });
})
.catch(error => console.error('Error loading data:', error));