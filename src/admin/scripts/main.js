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
            <input type="text" class="from-airport" list="airports-list-${flightId}-from" 
                   value="${flightData ? flightData.from : ''}" 
                   placeholder="Search airport..." required>
            <datalist id="airports-list-${flightId}-from">
                ${airportOptions}
            </datalist>
        </div>
        <div class="form-group">
            <label>To</label>
            <input type="text" class="to-airport" list="airports-list-${flightId}-to" 
                   value="${flightData ? flightData.to : ''}" 
                   placeholder="Search airport..." required>
            <datalist id="airports-list-${flightId}-to">
                ${airportOptions}
            </datalist>
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
    const statusDiv = document.getElementById('load-status');
    
    if (!username) {
        statusDiv.className = 'load-status error';
        statusDiv.textContent = 'Please enter a username';
        return;
    }
    
    statusDiv.className = 'load-status';
    statusDiv.textContent = 'Loading...';
    
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
            
            statusDiv.className = 'load-status success';
            statusDiv.textContent = `✓ Loaded ${flights.length} flight${flights.length !== 1 ? 's' : ''} for ${username}`;
        })
        .catch(error => {
            console.error('Error loading user data:', error);
            statusDiv.className = 'load-status error';
            statusDiv.textContent = `✗ User "${username}" not found`;
        });
}

// Generate and download JSON
function downloadJSON() {
    const flightRows = document.querySelectorAll('.flight-row');
    const flights = [];
    const emptyRows = [];
    const incompleteRows = [];
    
    // Clear any previous highlights
    flightRows.forEach(row => row.classList.remove('row-error'));
    
    flightRows.forEach((row, index) => {
        const tripDate = row.querySelector('.trip-date').value.trim();
        const from = row.querySelector('.from-airport').value.trim();
        const to = row.querySelector('.to-airport').value.trim();
        const flight = row.querySelector('.flight-number').value.trim();
        
        // Check if all fields are filled
        if (tripDate && from && to && flight) {
            flights.push({
                tripDate,
                from,
                to,
                flight
            });
        } else if (tripDate || from || to || flight) {
            // Row has some data but not all fields filled
            incompleteRows.push(index + 1);
            row.classList.add('row-error');
        } else {
            // Completely empty row
            emptyRows.push(index + 1);
        }
    });
    
    // Validate all rows are complete
    if (incompleteRows.length > 0) {
        const statusDiv = document.getElementById('load-status');
        statusDiv.className = 'load-status error';
        statusDiv.textContent = `✗ Incomplete data in row${incompleteRows.length > 1 ? 's' : ''}: ${incompleteRows.join(', ')}. Please fill all fields.`;
        return;
    }
    
    if (flights.length === 0) {
        const statusDiv = document.getElementById('load-status');
        statusDiv.className = 'load-status error';
        statusDiv.textContent = '✗ Please add at least one flight with all fields filled';
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
    
    // Show success message
    const statusDiv = document.getElementById('load-status');
    statusDiv.className = 'load-status success';
    statusDiv.textContent = `✓ Downloaded ${flights.length} flight${flights.length !== 1 ? 's' : ''} as ${filename}`;
}

// Airport Management Functions
let airportsData = {};

// Load airport data from remote server
function loadAirportData() {
    const statusDiv = document.getElementById('airport-load-status');
    statusDiv.className = 'load-status';
    statusDiv.textContent = 'Loading airports...';
    
    const url = 'https://flights.wherehaveibeento.me/data/airports.json';
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Airport data not found');
            }
            return response.json();
        })
        .then(data => {
            airportsData = data;
            displayAirports();
            
            statusDiv.className = 'load-status success';
            statusDiv.textContent = `✓ Loaded ${Object.keys(airportsData).length} airports`;
        })
        .catch(error => {
            console.error('Error loading airport data:', error);
            statusDiv.className = 'load-status error';
            statusDiv.textContent = '✗ Failed to load airport data';
        });
}

// Display airports in the grid
function displayAirports() {
    const container = document.getElementById('airports-list');
    const count = document.getElementById('airport-count');
    
    const airportCodes = Object.keys(airportsData).sort();
    count.textContent = airportCodes.length;
    
    if (airportCodes.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: #666;">No airports loaded yet</p>';
        return;
    }
    
    container.innerHTML = airportCodes.map(code => {
        const airport = airportsData[code];
        return `<div class="airport-item">
            <strong>${code}</strong> - ${airport.city || 'Unknown'}<br>
            <small style="color: #666;">${airport.name || 'N/A'}</small>
        </div>`;
    }).join('');
}

// Add new airport
function addNewAirport() {
    const codeInput = document.getElementById('new-airport-code');
    const code = codeInput.value.trim().toUpperCase();
    const statusDiv = document.getElementById('add-airport-status');
    
    if (!code || code.length !== 3) {
        statusDiv.className = 'load-status error';
        statusDiv.textContent = '✗ Please enter a valid 3-letter IATA code';
        return;
    }
    
    if (airportsData[code]) {
        statusDiv.className = 'load-status error';
        statusDiv.textContent = `✗ Airport ${code} already exists`;
        return;
    }
    
    // Show loading state
    statusDiv.className = 'load-status';
    statusDiv.textContent = `Fetching details for ${code}...`;
    
    // Fetch airport details from API
    fetch(`https://iata-airports.p.rapidapi.com/airports/${code}/`, {
        method: 'GET',
        headers: {
            'x-rapidapi-host': 'iata-airports.p.rapidapi.com',
            'x-rapidapi-key': 'f6a8296e02msh22e313fbb77b5f3p10a69cjsnea71dd865068'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Airport not found');
        }
        return response.json();
    })
    .then(data => {
        // Validate we got the required data
        if (!data.code || !data.name || !data.city || data.latitude === undefined || data.longitude === undefined) {
            throw new Error('Incomplete airport data received');
        }
        
        // Add airport to our data
        airportsData[code] = {
            name: data.name,
            city: data.city,
            coords: [data.latitude, data.longitude]
        };
        
        displayAirports();
        codeInput.value = '';
        
        statusDiv.className = 'load-status success';
        statusDiv.textContent = `✓ Added ${code} - ${data.city} (${data.name})`;
    })
    .catch(error => {
        console.error('Error fetching airport data:', error);
        statusDiv.className = 'load-status error';
        statusDiv.textContent = `✗ Failed to fetch details for ${code}. Airport may not exist or API error occurred.`;
    });
}

// Download airports.json
function downloadAirportJSON() {
    const statusDiv = document.getElementById('add-airport-status');
    
    if (Object.keys(airportsData).length === 0) {
        statusDiv.className = 'load-status error';
        statusDiv.textContent = '✗ No airports to download. Load data first.';
        return;
    }
    
    const jsonString = JSON.stringify(airportsData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'airports.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    statusDiv.className = 'load-status success';
    statusDiv.textContent = `✓ Downloaded ${Object.keys(airportsData).length} airports as airports.json`;
}