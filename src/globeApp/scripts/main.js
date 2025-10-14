// Main application controller
console.log('Loading main.js...');

class WhereHaveIBeenTo {
    constructor() {
        this.globe = null;
        this.currentStatementIndex = 0;
        this.statementInterval = null;
        
        // Animation timing constants
        this.ANIMATION_DURATION_PER_COUNTRY = 4500; // ms per country in journey animation
        this.ANIMATION_BUFFER_MS = 3000; // additional buffer time after animation
        
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
        // Load travel data first, then wait for libraries
        this.loadTravelData().then(() => {
            return this.waitForLibraries();
        }).then(() => {
            // Initialize globe visualization
            this.globe = new GlobeVisualization('globe-container');

            // Setup sidebar
            this.setupSidebar();
        }).catch(error => {
            console.error('Failed to start application:', error);
        });
    }

    async loadTravelData() {
        try {
            console.log('Loading travel data...');
            await TravelData.loadTravelData();
            console.log('Travel data loaded successfully');
        } catch (error) {
            console.error('Failed to load travel data:', error);
            throw error;
        }
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

    // Get countries sorted chronologically (oldest to newest)
    getCountriesSortedChronologically() {
        return TravelData.getCountriesSortedChronologically();
    }

    setupSidebar() {
        const countriesList = document.getElementById('countries-list');
        const travelSummary = document.getElementById('travel-summary');

        // Get countries sorted chronologically (oldest to newest)
        const countries = this.getCountriesSortedChronologically();
        const totalCountries = TravelData.getTotalCountries();
        const totalContinents = TravelData.getTotalContinents();
        const totalDays = TravelData.getTotalDaysAllCountries();
        const yearsSinceFirstTrip = TravelData.getYearsSinceFirstTrip();
        
        // Check if user has any stays to determine if we should show stay info
        const hasStays = TravelData.hasAnyStays();
        const totalStayCountries = hasStays ? TravelData.getTotalStayCountries() : 0;
        
        // Create alternating statements
        const statements = [
            `Explored ${totalCountries} countries so far`,
            `Wandered across ${totalContinents} continents`,
            `Spent ${totalDays} days away from home`,
            `Been chasing sunsets for ${yearsSinceFirstTrip} years`
        ];
        
        // Add stay statement if user has any stays
        if (hasStays) {
            statements.push(`Lived in ${totalStayCountries} countr${totalStayCountries === 1 ? 'y' : 'ies'}`);
        }

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
            const hasStayVisits = country.visits.some(visit => visit.stayType === 'stay');
            const stayInfo = hasStayVisits ? TravelData.getStayInfo(country) : '';
            
            // Count trip and stay visits separately
            const tripVisits = country.visits.filter(visit => visit.stayType === 'trip').length;
            const stayVisits = country.visits.filter(visit => visit.stayType === 'stay').length;
            
            let visitsDisplay = '';
            if (tripVisits > 0 && stayVisits > 0) {
                visitsDisplay = `${tripVisits} trip${tripVisits > 1 ? 's' : ''}, ${stayVisits} stay${stayVisits > 1 ? 's' : ''}`;
            } else if (tripVisits > 0) {
                visitsDisplay = `${tripVisits} visit${tripVisits > 1 ? 's' : ''}`;
            } else if (stayVisits > 0) {
                visitsDisplay = `${stayVisits} stay${stayVisits > 1 ? 's' : ''}`;
            }
            
            // Build the date display
            let dateDisplay = visitInfo;
            if (hasStayVisits && visitInfo && stayInfo) {
                dateDisplay = `Trips: ${visitInfo} | Stays: ${stayInfo}`;
            } else if (hasStayVisits && stayInfo) {
                dateDisplay = `Stays: ${stayInfo}`;
            }
            
            countryItem.innerHTML = `
                <div class="country-header">
                    <span class="flag">${country.flag}</span>
                    <div class="country-info">
                        <span class="country-name">${country.name}</span>
                        <span class="continent">${country.continent}</span>
                    </div>
                    <span class="visit-dates">${dateDisplay}</span>
                </div>
                <div class="country-stats">
                    <span class="visits">${visitsDisplay}</span>
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

        // Setup journey animation button
        const playButton = document.getElementById('play-journey-btn');
        if (playButton) {
            playButton.addEventListener('click', () => {
                if (this.globe) {
                    // Change button text during animation
                    playButton.textContent = 'Playing...';
                    playButton.disabled = true;
                    
                    this.globe.startJourneyAnimation();
                    
                    // Reset button after animation completes (with some buffer time)
                    setTimeout(() => {
                        playButton.textContent = '▶ Play Journey';
                        playButton.disabled = false;
                    }, (countries.length * this.ANIMATION_DURATION_PER_COUNTRY) + this.ANIMATION_BUFFER_MS);
                }
            });
        }
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
