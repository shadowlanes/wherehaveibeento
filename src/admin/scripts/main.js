// Load airports data
let airports = {};
let flightCounter = 0;
let currentUsername = '';

// Load airports from the remote server
fetch('https://flights.wherehaveibeento.me/data/airports.json')
    .then(response => response.json())
    .then(data => {
        airports = data;
        console.log('Airports loaded from remote:', Object.keys(airports).length);
        // Add initial flight row
        addFlight();
    })
    .catch(error => {
        console.error('Error loading airports:', error);
        alert('Failed to load airports data from server');
    });

// Tab switching
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    const buttons = document.querySelectorAll('.tab-button');
    
    tabs.forEach(tab => tab.classList.remove('active'));
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Add new flight row
function addFlight(flightData = null) {
    const container = document.getElementById('flights-container');
    const flightId = flightCounter++;
    
    const flightRow = document.createElement('div');
    flightRow.className = 'flight-row';
    flightRow.id = `flight-${flightId}`;
    
    // Create airport options
    const airportOptions = Object.keys(airports)
        .sort()
        .map(code => {
            const airport = airports[code];
            const city = airport.city || 'Unknown';
            return `<option value="${code}">${code} - ${city}</option>`;
        })
        .join('');
    
    flightRow.innerHTML = `
        <div class="form-group">
            <label>Trip Date</label>
            <input type="date" class="trip-date" value="${flightData ? flightData.tripDate : ''}" required>
        </div>
        <div class="form-group">
            <label>From</label>
            <select class="from-airport" required>
                <option value="">Select Airport</option>
                ${airportOptions}
            </select>
        </div>
        <div class="form-group">
            <label>To</label>
            <select class="to-airport" required>
                <option value="">Select Airport</option>
                ${airportOptions}
            </select>
        </div>
        <div class="form-group">
            <label>Flight Number</label>
            <input type="text" class="flight-number" value="${flightData ? flightData.flight : ''}" placeholder="e.g. 6E123" required>
        </div>
        <div class="form-group">
            <label>&nbsp;</label>
            <button class="btn btn-remove" onclick="removeFlight(${flightId})">Remove</button>
        </div>
    `;
    
    container.appendChild(flightRow);
    
    // Set selected values for airports if data provided
    if (flightData) {
        flightRow.querySelector('.from-airport').value = flightData.from;
        flightRow.querySelector('.to-airport').value = flightData.to;
    }
}

// Remove flight row
function removeFlight(flightId) {
    const flightRow = document.getElementById(`flight-${flightId}`);
    if (flightRow) {
        flightRow.remove();
    }
}

// Load user data from remote server
function loadUserData() {
    const username = document.getElementById('username').value.trim().toLowerCase();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    currentUsername = username;
    const url = `https://flights.wherehaveibeento.me/data/${username}.json`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('User data not found');
            }
            return response.json();
        })
        .then(flights => {
            // Clear existing flights
            document.getElementById('flights-container').innerHTML = '';
            flightCounter = 0;
            
            // Populate with loaded data
            flights.forEach(flight => {
                addFlight(flight);
            });
            
            alert(`Loaded ${flights.length} flights for ${username}`);
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            alert(`Failed to load data for ${username}. User might not exist or there was a network error.`);
        });
}

// Generate and download JSON
function downloadJSON() {
    const flightRows = document.querySelectorAll('.flight-row');
    const flights = [];
    
    flightRows.forEach(row => {
        const tripDate = row.querySelector('.trip-date').value;
        const from = row.querySelector('.from-airport').value;
        const to = row.querySelector('.to-airport').value;
        const flight = row.querySelector('.flight-number').value;
        
        if (tripDate && from && to && flight) {
            flights.push({
                tripDate,
                from,
                to,
                flight
            });
        }
    });
    
    if (flights.length === 0) {
        alert('Please add at least one flight with all fields filled');
        return;
    }
    
    // Create JSON file and download
    const jsonString = JSON.stringify(flights, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Use username if available, otherwise default filename
    const username = document.getElementById('username').value.trim().toLowerCase();
    const filename = username ? `${username}.json` : 'user-flights.json';
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}