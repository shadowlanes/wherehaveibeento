// Debug version - let's add some console logs
console.log('Loading data.js...');

// Data module for storing travel information
// This is the main data structure - modify this to add more countries as you travel

const countriesTravelled = [
    {
        name: "Maldives",
        code: "MV",
        flag: "🇲🇻",
        continent: "Asia",
        visits: [
            { date: "23/12/2017 - 26/12/2017", startDate: "23/12/2017", endDate: "26/12/2017", month: 12, year: 2017 }
        ],
        coordinates: { lat: 3.2028, lng: 73.2207 }
    },
    {
        name: "Sri Lanka",
        code: "LK",
        flag: "🇱🇰",
        continent: "Asia",
        visits: [
            { date: "31/12/2019 - 05/01/2020", startDate: "31/12/2019", endDate: "05/01/2020", month: 12, year: 2019 }
        ],
        coordinates: { lat: 7.8731, lng: 80.7718 }
    },
    {
        name: "Thailand",
        code: "TH",
        flag: "🇹🇭",
        continent: "Asia",
        visits: [
            { date: "12/02/2020 - 16/02/2020", startDate: "12/02/2020", endDate: "16/02/2020", month: 2, year: 2020, places: "Phuket, Krabi" }
        ],
        coordinates: { lat: 15.8700, lng: 100.9925 }
    },
    {
        name: "Egypt",
        code: "EG",
        flag: "🇪🇬",
        continent: "Africa",
        visits: [
            { date: "17/11/2023 - 25/11/2023", startDate: "17/11/2023", endDate: "25/11/2023", month: 11, year: 2023, places: "Cairo, Aswan, Luxor" }
        ],
        coordinates: { lat: 26.0975, lng: 30.0444 }
    },
    {
        name: "Bahrain",
        code: "BH",
        flag: "🇧🇭",
        continent: "Asia",
        visits: [
            { date: "29/02/2024 - 02/03/2024", startDate: "29/02/2024", endDate: "02/03/2024", month: 2, year: 2024 }
        ],
        coordinates: { lat: 25.9304, lng: 50.6378 }
    },
    {
        name: "Jordan",
        code: "JO",
        flag: "🇯🇴",
        continent: "Asia",
        visits: [
            { date: "08/03/2024 - 12/03/2024", startDate: "08/03/2024", endDate: "12/03/2024", month: 3, year: 2024, places: "Amman, Petra" }
        ],
        coordinates: { lat: 30.5852, lng: 36.2384 }
    },
    {
        name: "Georgia",
        code: "GE",
        flag: "🇬🇪",
        continent: "Asia",
        visits: [
            { date: "24/07/2024 - 01/08/2024", startDate: "24/07/2024", endDate: "01/08/2024", month: 7, year: 2024, places: "Kutaisi, Mestia, Tbilisi" }
        ],
        coordinates: { lat: 42.3154, lng: 43.3569 }
    },
    {
        name: "Azerbaijan",
        code: "AZ",
        flag: "🇦🇿",
        continent: "Asia",
        visits: [
            { date: "01/08/2024 - 05/08/2024", startDate: "01/08/2024", endDate: "05/08/2024", month: 8, year: 2024 }
        ],
        coordinates: { lat: 40.1431, lng: 47.5769 }
    },
    {
        name: "Oman",
        code: "OM",
        flag: "🇴🇲",
        continent: "Asia",
        visits: [
            { date: "27/08/2024 - 29/08/2024", startDate: "27/08/2024", endDate: "29/08/2024", month: 8, year: 2024 }
        ],
        coordinates: { lat: 21.4735, lng: 55.9754 }
    },
    {
        name: "Singapore",
        code: "SG",
        flag: "🇸🇬",
        continent: "Asia",
        visits: [
            { date: "14/09/2024 - 04/10/2024", startDate: "14/09/2024", endDate: "04/10/2024", month: 9, year: 2024 }
        ],
        coordinates: { lat: 1.3521, lng: 103.8198 }
    },
    {
        name: "Armenia",
        code: "AM",
        flag: "🇦🇲",
        continent: "Asia",
        visits: [
            { date: "03/05/2025 - 07/05/2025", startDate: "03/05/2025", endDate: "07/05/2025", month: 5, year: 2025 }
        ],
        coordinates: { lat: 40.0691, lng: 45.0382 }
    }
];

console.log('Countries data loaded:', countriesTravelled);

// Helper functions for data manipulation
class TravelData {
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
}

// Export for use in other modules
window.TravelData = TravelData;
window.countriesTravelled = countriesTravelled;

console.log('TravelData class created and exported to window');
