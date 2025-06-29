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
        return countriesTravelled.length;
    }
    
    static getTotalVisits() {
        return countriesTravelled.reduce((total, country) => total + country.visits.length, 0);
    }
    
    static getMostRecentVisit(country) {
        if (!country.visits || country.visits.length === 0) return null;
        
        // Sort visits by year and month to get the most recent
        const sortedVisits = country.visits.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        return sortedVisits[0];
    }
    
    static getAllVisitsSorted(country) {
        if (!country.visits || country.visits.length === 0) return [];
        
        // Sort visits chronologically (oldest first)
        return country.visits.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
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

    // Calculate total days spent in a country
    static getTotalDays(country) {
        if (!country.visits || country.visits.length === 0) return 0;
        
        return country.visits.reduce((totalDays, visit) => {
            const startDate = new Date(visit.startDate.split('/').reverse().join('-'));
            const endDate = new Date(visit.endDate.split('/').reverse().join('-'));
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
            return totalDays + days;
        }, 0);
    }

    // Get month name from number
    static getMonthName(monthNumber) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[monthNumber - 1];
    }

    // Get formatted visit info (Month Year)
    static getVisitInfo(country) {
        if (!country.visits || country.visits.length === 0) return '';
        
        return country.visits.map(visit => 
            `${this.getMonthName(visit.month)} ${visit.year}`
        ).join(', ');
    }

    // Get number of unique continents visited
    static getTotalContinents() {
        const continents = new Set(countriesTravelled.map(country => country.continent));
        return continents.size;
    }

    // Get total days across all countries
    static getTotalDaysAllCountries() {
        return countriesTravelled.reduce((total, country) => {
            return total + this.getTotalDays(country);
        }, 0);
    }

    // Get years since first trip
    static getYearsSinceFirstTrip() {
        if (countriesTravelled.length === 0) return 0;
        
        // Find the earliest trip year
        let earliestYear = Math.min(...countriesTravelled.flatMap(country => 
            country.visits.map(visit => visit.year)
        ));
        
        const currentYear = new Date().getFullYear();
        return currentYear - earliestYear;
    }

    // Get most recent visit date as a comparable value for sorting
    static getMostRecentVisitDate(country) {
        if (!country.visits || country.visits.length === 0) return new Date(0); // Very old date for countries with no visits
        
        // Find the most recent visit
        const mostRecent = country.visits.reduce((latest, visit) => {
            const visitDate = new Date(visit.startDate.split('/').reverse().join('-'));
            const latestDate = new Date(latest.startDate.split('/').reverse().join('-'));
            return visitDate > latestDate ? visit : latest;
        });
        
        return new Date(mostRecent.startDate.split('/').reverse().join('-'));
    }

    // Get countries sorted by most recent visit first
    static getCountriesSortedByRecentVisit() {
        return [...countriesTravelled].sort((a, b) => {
            const dateA = this.getMostRecentVisitDate(a);
            const dateB = this.getMostRecentVisitDate(b);
            return dateB - dateA; // Most recent first (descending order)
        });
    }
}

// Export for use in other modules
window.TravelData = TravelData;
window.countriesTravelled = countriesTravelled;

console.log('TravelData class created and exported to window');
