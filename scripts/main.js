// Main application controller
console.log('Loading main.js...');

class WhereHaveIBeenTo {
    constructor() {
        this.globe = null;
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.start());
        } else {
            this.start();
        }
    }

    start() {
        // Wait for all libraries to load
        this.waitForLibraries().then(() => {
            // Initialize globe visualization
            this.globe = new GlobeVisualization('globe-container');

            // Setup sidebar
            this.setupSidebar();
        });
    }

    waitForLibraries() {
        return new Promise((resolve) => {
            console.log('Waiting for libraries...');
            let attempts = 0;
            const maxAttempts = 50; // Prevent infinite loops

            const checkLibraries = () => {
                if (window.Globe && window.TravelData) {
                    console.log('All libraries loaded!');
                    resolve();
                } else if (attempts < maxAttempts) {
                    attempts++;
                    setTimeout(checkLibraries, 100);
                } else {
                    console.error('Failed to load libraries.');
                }
            };

            checkLibraries();
        });
    }

    setupSidebar() {
        const countriesList = document.getElementById('countries-list');
        const totalCountries = document.getElementById('total-countries');
        const totalVisits = document.getElementById('total-visits');

        const countries = TravelData.getCountries();
        countriesList.innerHTML = '';

        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            
            // Create detailed visit information
            const allVisits = TravelData.getAllVisitsSorted(country);
            const visitsList = allVisits.map(visit => visit.date).join(', ');
            
            countryItem.innerHTML = `
                <strong>${country.name}</strong><br>
                <small>Visits: ${country.visits.length}</small><br>
                <small class="visits-list">${visitsList}</small>
            `;
            
            // Add click handler to focus on country
            countryItem.addEventListener('click', () => {
                if (this.globe && this.globe.globe) {
                    this.globe.globe.pointOfView({ 
                        lat: country.coordinates.lat, 
                        lng: country.coordinates.lng, 
                        altitude: 2 
                    }, 1000);
                }
            });
            
            countryItem.style.cursor = 'pointer';
            countriesList.appendChild(countryItem);
        });

        totalCountries.textContent = `Countries: ${TravelData.getTotalCountries()}`;
        totalVisits.textContent = `Total Visits: ${TravelData.getTotalVisits()}`;
    }
}

console.log('Main application module loaded.');

// Initialize the application
new WhereHaveIBeenTo();
