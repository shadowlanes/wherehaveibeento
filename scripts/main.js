// Main application controller
console.log('Loading main.js...');

class WhereHaveIBeenTo {
    constructor() {
        this.globe = null;
        this.currentStatementIndex = 0;
        this.statementInterval = null;
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
        const travelSummary = document.getElementById('travel-summary');

        const countries = TravelData.getCountries();
        const totalCountries = TravelData.getTotalCountries();
        const totalContinents = TravelData.getTotalContinents();
        const totalDays = TravelData.getTotalDaysAllCountries();
        const yearsSinceFirstTrip = TravelData.getYearsSinceFirstTrip();
        
        // Create alternating statements
        const statements = [
            `Explored ${totalCountries} countries so far`,
            `Wandered across ${totalContinents} continents`,
            `Spent ${totalDays} days away from home`,
            `Been chasing sunsets for ${yearsSinceFirstTrip} years`
        ];

        // Function to update the statement with drop animation effect
        const updateStatement = () => {
            // Add drop-out animation
            travelSummary.classList.add('drop-out');
            
            // After drop-out animation completes, change text and drop-in
            setTimeout(() => {
                // Update text
                travelSummary.textContent = statements[this.currentStatementIndex];
                this.currentStatementIndex = (this.currentStatementIndex + 1) % statements.length;
                
                // Remove drop-out and add drop-in animation
                travelSummary.classList.remove('drop-out');
                travelSummary.classList.add('drop-in');
                
                // Remove drop-in class after animation completes
                setTimeout(() => {
                    travelSummary.classList.remove('drop-in');
                }, 500); // Duration of drop-in animation
                
            }, 500); // Duration of drop-out animation
        };

        // Initialize with first statement
        updateStatement();

        // Set up interval to rotate statements every 4 seconds (giving time for animations)
        this.statementInterval = setInterval(updateStatement, 4000);

        // Clear and populate countries list
        countriesList.innerHTML = '';

        countries.forEach(country => {
            const countryItem = document.createElement('div');
            countryItem.className = 'country-item';
            
            const countryDays = TravelData.getTotalDays(country);
            const visitInfo = TravelData.getVisitInfo(country);
            
            countryItem.innerHTML = `
                <div class="country-header">
                    <span class="flag">${country.flag}</span>
                    <div class="country-info">
                        <span class="country-name">${country.name}</span>
                        <span class="continent">${country.continent}</span>
                    </div>
                    <span class="visit-dates">${visitInfo}</span>
                </div>
                <div class="country-stats">
                    <span class="visits">${country.visits.length} visit${country.visits.length > 1 ? 's' : ''}</span>
                    <span class="days">${countryDays} day${countryDays > 1 ? 's' : ''}</span>
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
    }

    // Cleanup method to clear intervals
    destroy() {
        if (this.statementInterval) {
            clearInterval(this.statementInterval);
            this.statementInterval = null;
        }
    }
}

console.log('Main application module loaded.');

// Initialize the application
new WhereHaveIBeenTo();
