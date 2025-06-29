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
        
        // Update totals first (at the top)
        totalCountries.textContent = `Countries: ${TravelData.getTotalCountries()}`;
        totalVisits.textContent = `Total Visits: ${TravelData.getTotalVisits()}`;

        // Clear and populate countries list
        countriesList.innerHTML = '';

        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            
            const totalDays = TravelData.getTotalDays(country);
            const visitInfo = TravelData.getVisitInfo(country);
            
            countryItem.innerHTML = `
                <div class="country-header">
                    <span class="flag">${country.flag}</span>
                    <span class="country-name">${country.name}</span>
                </div>
                <div class="country-stats">
                    <span class="visits">${country.visits.length} visit${country.visits.length > 1 ? 's' : ''}</span>
                    <span class="days">${totalDays} day${totalDays > 1 ? 's' : ''}</span>
                    <span class="visit-dates">${visitInfo}</span>
                </div>
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
