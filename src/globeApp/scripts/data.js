// Data module for storing travel information
// Dynamically loads travel data based on subdomain

console.log('Loading data.js...');

// Global variable to store the loaded countries data
let countriesTravelled = [];

// Helper functions for data manipulation
class TravelData {
    static async loadTravelData() {
        try {
            // Extract subdomain from current URL
            const hostname = window.location.hostname;
            let subdomain = 'shom'; // default fallback
            
            // Parse subdomain from hostname
            if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
                const parts = hostname.split('.');
                if (parts.length > 2) {
                    subdomain = parts[0];
                } else if (parts.length === 2 && parts[0] !== 'localhost') {
                    // Handle cases like "shom.localhost"
                    subdomain = parts[0];
                }
            } else {
                // For localhost development, check if there's a subdomain pattern
                const parts = hostname.split('.');
                if (parts.length > 1 && parts[0] !== 'localhost') {
                    subdomain = parts[0];
                }
            }
            
            console.log('Detected subdomain:', subdomain);
            console.log('Full hostname:', hostname);
            
            // Construct the JSON file path
            const jsonFile = `travelHistory/${subdomain}_countriesTravelled.json`;
            console.log('Loading travel data from:', jsonFile);
            
            // Fetch the JSON data
            const response = await fetch(jsonFile);
            
            if (!response.ok) {
                console.warn(`Failed to load ${jsonFile}, falling back to default`);
                // Try to load default shom file as fallback
                const fallbackResponse = await fetch('travelHistory/shom_countriesTravelled.json');
                if (!fallbackResponse.ok) {
                    throw new Error('Failed to load fallback travel data');
                }
                countriesTravelled = await fallbackResponse.json();
            } else {
                countriesTravelled = await response.json();
            }
            
            console.log('Travel data loaded successfully:', countriesTravelled);
            
            // Trigger a custom event to notify other modules that data is loaded
            window.dispatchEvent(new CustomEvent('travelDataLoaded', {
                detail: { countries: countriesTravelled }
            }));
            
            return countriesTravelled;
            
        } catch (error) {
            console.error('Error loading travel data:', error);
            // Return empty array as fallback
            countriesTravelled = [];
            return countriesTravelled;
        }
    }
    
    static getCountries() {
        return countriesTravelled;
    }
    
    static getTotalCountries() {
        // Count only countries with trip visits
        return countriesTravelled.filter(country => 
            country.visits.some(visit => visit.stayType === 'trip')
        ).length;
    }
    
    static getTotalVisits() {
        // Count only trip visits
        return countriesTravelled.reduce((total, country) => {
            const tripVisits = country.visits.filter(visit => visit.stayType === 'trip');
            return total + tripVisits.length;
        }, 0);
    }
    
    static getTotalStayCountries() {
        // Count countries where user has lived (stay visits)
        return countriesTravelled.filter(country => 
            country.visits.some(visit => visit.stayType === 'stay')
        ).length;
    }
    
    static getTotalStays() {
        // Count only stay visits
        return countriesTravelled.reduce((total, country) => {
            const stayVisits = country.visits.filter(visit => visit.stayType === 'stay');
            return total + stayVisits.length;
        }, 0);
    }
    
    static getCountriesWithTrips() {
        // Get countries that have trip visits
        return countriesTravelled.filter(country => 
            country.visits.some(visit => visit.stayType === 'trip')
        );
    }
    
    static getCountriesWithStays() {
        // Get countries that have stay visits
        return countriesTravelled.filter(country => 
            country.visits.some(visit => visit.stayType === 'stay')
        );
    }
    
    static hasAnyStays() {
        // Check if user has any stay visits
        return countriesTravelled.some(country => 
            country.visits.some(visit => visit.stayType === 'stay')
        );
    }
    
    static getMostRecentVisit(country) {
        if (!country.visits || country.visits.length === 0) return null;
        
        // Sort visits by startDate to get the most recent
        const sortedVisits = [...country.visits].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        
        return sortedVisits[0];
    }
    
    static getAllVisitsSorted(country) {
        if (!country.visits || country.visits.length === 0) return [];
        
        // Sort visits chronologically (oldest first)
        return [...country.visits].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    
    // Add a new country (for future use)
    static addCountry(countryData) {
        countriesTravelled.push(countryData);
    }
    
    // Add a visit to existing country (for future use)
    static addVisit(countryCode, visitData) {
        const country = countriesTravelled.find(c => c.code === countryCode);
        if (country) {
            country.visits.push(visitData);
        }
    }

    // Calculate total days spent in a country (trips only by default)
    static getTotalDays(country, includeStays = false) {
        if (!country.visits || country.visits.length === 0) return 0;
        
        const visitsToCount = includeStays ? 
            country.visits : 
            country.visits.filter(visit => visit.stayType === 'trip');
        
        return visitsToCount.reduce((totalDays, visit) => {
            const startDate = new Date(visit.startDate);
            const endDate = new Date(visit.endDate);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            return totalDays + days;
        }, 0);
    }
    
    // Calculate total days spent in stays only
    static getTotalStayDays(country) {
        if (!country.visits || country.visits.length === 0) return 0;
        
        const stayVisits = country.visits.filter(visit => visit.stayType === 'stay');
        
        return stayVisits.reduce((totalDays, visit) => {
            const startDate = new Date(visit.startDate);
            const endDate = new Date(visit.endDate);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            return totalDays + days;
        }, 0);
    }

    // Get month name from number
    static getMonthName(monthNumber) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthNumber - 1];
    }

    // Get formatted visit info (Month Year) - trips only by default
    static getVisitInfo(country, includeStays = false) {
        if (!country.visits || country.visits.length === 0) return '';
        
        const visitsToShow = includeStays ? 
            country.visits : 
            country.visits.filter(visit => visit.stayType === 'trip');
        
        return visitsToShow.map(visit => {
            const date = new Date(visit.startDate);
            return `${this.getMonthName(date.getUTCMonth() + 1)} ${date.getUTCFullYear()}`;
        }).join(', ');
    }
    
    // Get formatted stay info (Month Year)
    static getStayInfo(country) {
        if (!country.visits || country.visits.length === 0) return '';
        
        const stayVisits = country.visits.filter(visit => visit.stayType === 'stay');
        
        return stayVisits.map(visit => {
            const date = new Date(visit.startDate);
            return `${this.getMonthName(date.getUTCMonth() + 1)} ${date.getUTCFullYear()}`;
        }).join(', ');
    }

    // Get number of unique continents visited (trips only)
    static getTotalContinents() {
        const countriesWithTrips = this.getCountriesWithTrips();
        const continents = new Set(countriesWithTrips.map(country => country.continent));
        return continents.size;
    }
    
    // Get number of unique continents lived in (stays only)
    static getTotalContinentsWithStays() {
        const countriesWithStays = this.getCountriesWithStays();
        const continents = new Set(countriesWithStays.map(country => country.continent));
        return continents.size;
    }

    // Get total days across all countries (trips only by default)
    static getTotalDaysAllCountries(includeStays = false) {
        return countriesTravelled.reduce((total, country) => {
            return total + this.getTotalDays(country, includeStays);
        }, 0);
    }
    
    // Get total days across all stay countries
    static getTotalStayDaysAllCountries() {
        return countriesTravelled.reduce((total, country) => {
            return total + this.getTotalStayDays(country);
        }, 0);
    }

    // Get years since first trip (trips only)
    static getYearsSinceFirstTrip() {
        const countriesWithTrips = this.getCountriesWithTrips();
        if (countriesWithTrips.length === 0) return 0;
        
        // Find the earliest trip year
        let earliestYear = Math.min(...countriesWithTrips.flatMap(country => 
            country.visits
                .filter(visit => visit.stayType === 'trip')
                .map(visit => new Date(visit.startDate).getUTCFullYear())
        ));
        
        const currentYear = new Date().getFullYear();
        return currentYear - earliestYear;
    }

    // Get most recent visit date as a comparable value for sorting (trips only by default)
    static getMostRecentVisitDate(country, includeStays = false) {
        if (!country.visits || country.visits.length === 0) return new Date(0); // Very old date for countries with no visits
        
        const visitsToCheck = includeStays ? 
            country.visits : 
            country.visits.filter(visit => visit.stayType === 'trip');
            
        if (visitsToCheck.length === 0) return new Date(0);
        
        // Find the most recent visit
        const mostRecent = visitsToCheck.reduce((latest, visit) => {
            const visitDate = new Date(visit.startDate);
            const latestDate = new Date(latest.startDate);
            return visitDate > latestDate ? visit : latest;
        });
        
        return new Date(mostRecent.startDate);
    }

    // Get countries sorted by most recent visit first (trips only by default)
    static getCountriesSortedByRecentVisit(includeStays = false) {
        const countriesToSort = includeStays ? 
            countriesTravelled : 
            this.getCountriesWithTrips();
            
        return [...countriesToSort].sort((a, b) => {
            const dateA = this.getMostRecentVisitDate(a, includeStays);
            const dateB = this.getMostRecentVisitDate(b, includeStays);
            return dateB - dateA; // Most recent first (descending order)
        });
    }
}

// Export for use in other modules
window.TravelData = TravelData;
window.countriesTravelled = countriesTravelled;

console.log('TravelData class created and exported to window');
window.TravelData = TravelData;
window.countriesTravelled = countriesTravelled;

console.log('TravelData class created and exported to window');
