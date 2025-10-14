// Visualization module for Globe.gl
console.log('Loading visualization.js...');

class GlobeVisualization {
    constructor(containerId) {
        console.log('Creating GlobeVisualization with container:', containerId);
        this.container = document.getElementById(containerId);
        this.tooltip = document.getElementById('tooltip');
        this.globe = null;
        this.worldCountries = null; // Store world countries GeoJSON
        this.isAnimating = false; // Track journey animation state
        this.journeyStep = 0; // Current step in journey animation
        this.journeyCountries = []; // Sorted countries for journey
        this.cachedPolygons = null; // Cache polygons to avoid redundant processing
        
        // Animation timing constants
        this.PHASE_TRANSITION_DELAY = 800; // Brief pause before starting next animation phase
        this.ARC_ANIMATION_DURATION = 2000; // Duration for arc animation to complete
        this.CAMERA_MOVEMENT_DURATION = 1500; // Duration for camera movement animation
        
        // Country code mapping from 2-letter to 3-letter codes
        this.countryCodeMap = {
            'AF': 'AFG', 'AL': 'ALB', 'DZ': 'DZA', 'AS': 'ASM', 'AD': 'AND', 'AO': 'AGO', 'AI': 'AIA',
            'AQ': 'ATA', 'AG': 'ATG', 'AR': 'ARG', 'AM': 'ARM', 'AW': 'ABW', 'AU': 'AUS', 'AT': 'AUT',
            'AZ': 'AZE', 'BS': 'BHS', 'BH': 'BHR', 'BD': 'BGD', 'BB': 'BRB', 'BY': 'BLR', 'BE': 'BEL',
            'BZ': 'BLZ', 'BJ': 'BEN', 'BM': 'BMU', 'BT': 'BTN', 'BO': 'BOL', 'BA': 'BIH', 'BW': 'BWA',
            'BR': 'BRA', 'BN': 'BRN', 'BG': 'BGR', 'BF': 'BFA', 'BI': 'BDI', 'KH': 'KHM', 'CM': 'CMR',
            'CA': 'CAN', 'CV': 'CPV', 'KY': 'CYM', 'CF': 'CAF', 'TD': 'TCD', 'CL': 'CHL', 'CN': 'CHN',
            'CO': 'COL', 'KM': 'COM', 'CG': 'COG', 'CD': 'COD', 'CK': 'COK', 'CR': 'CRI', 'CI': 'CIV',
            'HR': 'HRV', 'CU': 'CUB', 'CY': 'CYP', 'CZ': 'CZE', 'DK': 'DNK', 'DJ': 'DJI', 'DM': 'DMA',
            'DO': 'DOM', 'EC': 'ECU', 'EG': 'EGY', 'SV': 'SLV', 'GQ': 'GNQ', 'ER': 'ERI', 'EE': 'EST',
            'ET': 'ETH', 'FK': 'FLK', 'FO': 'FRO', 'FJ': 'FJI', 'FI': 'FIN', 'FR': 'FRA', 'GA': 'GAB',
            'GM': 'GMB', 'GE': 'GEO', 'DE': 'DEU', 'GH': 'GHA', 'GI': 'GIB', 'GR': 'GRC', 'GL': 'GRL',
            'GD': 'GRD', 'GU': 'GUM', 'GT': 'GTM', 'GG': 'GGY', 'GN': 'GIN', 'GW': 'GNB', 'GY': 'GUY',
            'HT': 'HTI', 'HN': 'HND', 'HK': 'HKG', 'HU': 'HUN', 'IS': 'ISL', 'IN': 'IND', 'ID': 'IDN',
            'IR': 'IRN', 'IQ': 'IRQ', 'IE': 'IRL', 'IM': 'IMN', 'IL': 'ISR', 'IT': 'ITA', 'JM': 'JAM',
            'JP': 'JPN', 'JE': 'JEY', 'JO': 'JOR', 'KZ': 'KAZ', 'KE': 'KEN', 'KI': 'KIR', 'KP': 'PRK',
            'KR': 'KOR', 'KW': 'KWT', 'KG': 'KGZ', 'LA': 'LAO', 'LV': 'LVA', 'LB': 'LBN', 'LS': 'LSO',
            'LR': 'LBR', 'LY': 'LBY', 'LI': 'LIE', 'LT': 'LTU', 'LU': 'LUX', 'MO': 'MAC', 'MK': 'MKD',
            'MG': 'MDG', 'MW': 'MWI', 'MY': 'MYS', 'MV': 'MDV', 'ML': 'MLI', 'MT': 'MLT', 'MH': 'MHL',
            'MR': 'MRT', 'MU': 'MUS', 'MX': 'MEX', 'FM': 'FSM', 'MD': 'MDA', 'MC': 'MCO', 'MN': 'MNG',
            'ME': 'MNE', 'MS': 'MSR', 'MA': 'MAR', 'MZ': 'MOZ', 'MM': 'MMR', 'NA': 'NAM', 'NR': 'NRU',
            'NP': 'NPL', 'NL': 'NLD', 'NZ': 'NZL', 'NI': 'NIC', 'NE': 'NER', 'NG': 'NGA', 'NU': 'NIU',
            'NF': 'NFK', 'MP': 'MNP', 'NO': 'NOR', 'OM': 'OMN', 'PK': 'PAK', 'PW': 'PLW', 'PS': 'PSE',
            'PA': 'PAN', 'PG': 'PNG', 'PY': 'PRY', 'PE': 'PER', 'PH': 'PHL', 'PN': 'PCN', 'PL': 'POL',
            'PT': 'PRT', 'PR': 'PRI', 'QA': 'QAT', 'RO': 'ROU', 'RU': 'RUS', 'RW': 'RWA', 'WS': 'WSM',
            'SM': 'SMR', 'ST': 'STP', 'SA': 'SAU', 'SN': 'SEN', 'RS': 'SRB', 'SC': 'SYC', 'SL': 'SLE',
            'SG': 'SGP', 'SK': 'SVK', 'SI': 'SVN', 'SB': 'SLB', 'SO': 'SOM', 'ZA': 'ZAF', 'SS': 'SSD',
            'ES': 'ESP', 'LK': 'LKA', 'SD': 'SDN', 'SR': 'SUR', 'SJ': 'SJM', 'SZ': 'SWZ', 'SE': 'SWE',
            'CH': 'CHE', 'SY': 'SYR', 'TW': 'TWN', 'TJ': 'TJK', 'TZ': 'TZA', 'TH': 'THA', 'TL': 'TLS',
            'TG': 'TGO', 'TK': 'TKL', 'TO': 'TON', 'TT': 'TTO', 'TN': 'TUN', 'TR': 'TUR', 'TM': 'TKM',
            'TC': 'TCA', 'TV': 'TUV', 'UG': 'UGA', 'UA': 'UKR', 'AE': 'ARE', 'GB': 'GBR', 'US': 'USA',
            'UY': 'URY', 'UZ': 'UZB', 'VU': 'VUT', 'VA': 'VAT', 'VE': 'VEN', 'VN': 'VNM', 'VG': 'VGB',
            'VI': 'VIR', 'WF': 'WLF', 'EH': 'ESH', 'YE': 'YEM', 'ZM': 'ZMB', 'ZW': 'ZWE'
        };
        
        this.init();
    }

    async init() {
        console.log('Initializing globe...');

        // Check if Globe.gl is available
        if (!window.Globe) {
            console.error('Globe.gl not loaded');
            return;
        }

        // Check if TravelData is available
        if (!window.TravelData) {
            console.error('TravelData not loaded');
            return;
        }

        // Load world countries data for polygon highlighting
        await this.loadWorldCountries();

        // Initialize Globe.gl with container
        this.globe = Globe()(this.container)
            .globeImageUrl('assets/earth-night.jpg')
            .backgroundImageUrl('assets/night-sky.png')
            .showAtmosphere(true)
            .atmosphereColor('#00d4ff')
            .atmosphereAltitude(0.25)
            .width(this.getResponsiveWidth())
            .height(this.getResponsiveHeight())
            // Country polygons for highlighting visited countries
            .polygonsData(this.getVisitedCountriesPolygons())
            .polygonCapColor(d => {
                const hasStays = d.properties.hasStays;
                return hasStays ? 'rgba(0, 255, 136, 0.6)' : 'rgba(255, 107, 53, 0.6)';
            })
            .polygonSideColor(d => {
                const hasStays = d.properties.hasStays;
                return hasStays ? 'rgba(0, 255, 136, 0.3)' : 'rgba(255, 107, 53, 0.3)';
            })
            .polygonStrokeColor(() => 'rgba(255, 255, 255, 0.2)')
            .polygonAltitude(0.01)
            .polygonsTransitionDuration(1000)
            // Points for visited countries
            .pointsData(TravelData.getCountries())
            .pointLat(d => d.coordinates.lat)
            .pointLng(d => d.coordinates.lng)
            .pointColor(d => {
                // Check if country has any stay visits
                const hasStays = d.visits.some(visit => visit.stayType === 'stay');
                return hasStays ? '#00ff88' : '#ff6b35'; // Green for stays, orange for trips
            })
            .pointAltitude(0.03)
            .pointRadius(0.9)
            .pointLabel(d => {
                const mostRecentVisit = TravelData.getMostRecentVisit(d, true); // Include stays in most recent check
                const hasStays = d.visits.some(visit => visit.stayType === 'stay');
                const stayText = hasStays ? ' (Lived here)' : '';
                return `<b>${d.name}${stayText}</b><br/>Last Visit: ${mostRecentVisit.date}<br/>Total Visits: ${d.visits.length}`;
            })
            // Rings for glowing effect
            .ringsData(TravelData.getCountries())
            .ringLat(d => d.coordinates.lat)
            .ringLng(d => d.coordinates.lng)
            .ringMaxRadius(3)
            .ringPropagationSpeed(1.5)
            .ringRepeatPeriod(2500)
            .ringColor(d => {
                // Match ring color to point color
                const hasStays = d.visits.some(visit => visit.stayType === 'stay');
                return hasStays ? ['#00ff88', '#00d4ff'] : ['#ff6b35', '#ff0080'];
            })
            // Hex polygons for atmosphere effect
            .hexPolygonsData(TravelData.getCountries())
            .hexPolygonResolution(3)
            .hexPolygonMargin(0.3)
            .hexPolygonColor(() => '#00d4ff')
            .hexPolygonAltitude(0.001)
            .hexPolygonLabel(d => '')
            // Event handlers
            .onPointHover((point, prevPoint) => {
                this.container.style.cursor = point ? 'pointer' : 'auto';
            })
            .onPointClick(point => {
                // Focus on clicked country with smooth animation
                this.globe.pointOfView({ lat: point.coordinates.lat, lng: point.coordinates.lng, altitude: 1.5 }, 1500);
            });

        console.log('Globe initialized successfully');

        // Enable auto-rotate with slower speed for better viewing
        this.globe.controls().autoRotate = true;
        this.globe.controls().autoRotateSpeed = 0.5; // Slower rotation

        // Add resize listener
        window.addEventListener('resize', () => {
            this.resizeGlobe();
        });
        
        // Initial resize to handle mobile
        setTimeout(() => this.resizeGlobe(), 100);
    }

    async loadWorldCountries() {
        try {
            console.log('Loading world countries data...');
            // Load world countries GeoJSON from local assets
            const response = await fetch('assets/countries.geo.json');
            if (!response.ok) {
                throw new Error('Failed to load world countries data');
            }
            const worldData = await response.json();
            this.worldCountries = worldData;
            console.log('World countries data loaded successfully');
        } catch (error) {
            console.error('Error loading world countries data:', error);
            this.worldCountries = null;
        }
    }

    getVisitedCountriesPolygons() {
        if (!this.worldCountries || !this.worldCountries.features) {
            console.warn('World countries data not available for polygon highlighting');
            return [];
        }

        const visitedCountries = TravelData.getCountries();
        console.log('Total visited countries from TravelData:', visitedCountries.length);
        console.log('Sample visited countries:', visitedCountries.slice(0, 3).map(c => ({ code: c.code, name: c.name })));
        
        console.log('Total world countries features:', this.worldCountries.features.length);
        console.log('Sample world countries:', this.worldCountries.features.slice(0, 3).map(f => ({ id: f.id, name: f.properties.name })));

        // Filter countries to only include visited ones
        const polygons = this.worldCountries.features
            .filter(country => {
                const threeLetterCode = country.id;
                // Find the 2-letter code that maps to this 3-letter code
                const twoLetterCode = Object.keys(this.countryCodeMap).find(key => this.countryCodeMap[key] === threeLetterCode);
                // Cache the twoLetterCode to avoid redundant lookups in map step
                country._twoLetterCode = twoLetterCode;
                return twoLetterCode && visitedCountries.some(c => c.code === twoLetterCode);
            })
            .map(country => {
                // Use cached twoLetterCode from filter step
                const twoLetterCode = country._twoLetterCode;
                const visitedCountry = visitedCountries.find(c => c.code === twoLetterCode);
                const hasStays = visitedCountry ? visitedCountry.visits.some(visit => visit.stayType === 'stay') : false;
                
                console.log(`→ Processing polygon for ${country.properties.name}: hasStays=${hasStays}`);
                
                return {
                    ...country,
                    properties: {
                        ...country.properties,
                        hasStays: hasStays,
                        name: visitedCountry ? visitedCountry.name : country.properties.name
                    }
                };
            });

        console.log(`Loaded ${polygons.length} country polygons for highlighting`);
        return polygons;
    }

    getResponsiveHeight() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // For mobile, use 50vh (half viewport) but with minimum height
            const mobileHeight = window.innerWidth <= 480 ? 
                Math.max(window.innerHeight * 0.45, 280) : 
                Math.max(window.innerHeight * 0.5, 300);
            return mobileHeight;
        }
        return this.container.clientHeight;
    }

    resizeGlobe() {
        this.globe
            .width(this.getResponsiveWidth())
            .height(this.getResponsiveHeight());
    }

    showTooltip(point) {
        if (point) {
            const mostRecentVisit = TravelData.getMostRecentVisit(point, true); // Include stays
            const hasStays = point.visits.some(visit => visit.stayType === 'stay');
            const stayText = hasStays ? ' (Lived here)' : '';
            this.tooltip.innerHTML = `<strong>${point.name}${stayText}</strong><br>Last Visit: ${mostRecentVisit.date}<br>Total Visits: ${point.visits.length}`;
            this.tooltip.style.display = 'block';
        }
    }

    hideTooltip() {
        this.tooltip.style.display = 'none';
    }

    getResponsiveWidth() {
        const isMobile = window.innerWidth <= 768;
        return isMobile ? window.innerWidth : this.container.clientWidth;
    }

    getResponsiveHeight() {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
            // For mobile, use 50vh (half viewport) but with minimum height
            const mobileHeight = window.innerWidth <= 480 ? 
                Math.max(window.innerHeight * 0.45, 280) : 
                Math.max(window.innerHeight * 0.5, 300);
            return mobileHeight;
        }
        return this.container.clientHeight;
    }

    // Get countries sorted chronologically by earliest visit date
    getChronologicalJourney() {
        return TravelData.getCountriesSortedChronologically();
    }

    // Start the journey animation
    startJourneyAnimation() {
        if (this.isAnimating) {
            console.log('Journey animation already running');
            return;
        }

        this.isAnimating = true;
        this.journeyStep = 0;
        this.journeyCountries = this.getChronologicalJourney();
        
        // Cache polygons once to avoid redundant processing during animation
        this.cachedPolygons = this.getVisitedCountriesPolygons();
        
        console.log(`Starting journey animation with ${this.journeyCountries.length} countries`);
        
        // Clear any existing highlights
        this.clearCountryHighlights();
        
        // Reset globe to initial state
        this.globe
            .polygonsData([]) // Clear all polygons
            .arcsData([]); // Clear all arcs
        
        // Start the animation sequence
        this.animateJourneyStep();
    }

    // Highlight a country tile in the sidebar
    highlightCountryTile(countryCode) {
        // Clear any existing highlights first
        this.clearCountryHighlights();
        
        // Find and highlight the matching country tile
        const countryItems = document.querySelectorAll('.country-item');
        countryItems.forEach(item => {
            const countryName = item.querySelector('.country-name');
            if (countryName) {
                // We need to match by country code, but the tiles show country names
                // Let's find the country data that matches this name
                const countries = TravelData.getCountries();
                const matchingCountry = countries.find(c => 
                    c.name.toLowerCase() === countryName.textContent.toLowerCase() && 
                    c.code === countryCode
                );
                
                if (matchingCountry) {
                    item.classList.add('highlighted');
                    // Scroll the highlighted item into view
                    item.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center',
                        inline: 'nearest' 
                    });
                }
            }
        });
    }

    // Clear all country tile highlights
    clearCountryHighlights() {
        const highlightedItems = document.querySelectorAll('.country-item.highlighted');
        highlightedItems.forEach(item => {
            item.classList.remove('highlighted');
        });
    }

    // Animate individual journey steps
    animateJourneyStep() {
        if (this.journeyStep >= this.journeyCountries.length) {
            // Animation complete
            this.isAnimating = false;
            console.log('Journey animation completed');
            
            // Clear highlights and restore all polygons at the end
            this.clearCountryHighlights();
            setTimeout(() => {
                this.globe.polygonsData(this.cachedPolygons);
            }, 1000);
            return;
        }

        const currentCountry = this.journeyCountries[this.journeyStep];
        const nextCountry = this.journeyCountries[this.journeyStep + 1];
        
        console.log(`Animating step ${this.journeyStep + 1}: ${currentCountry.name}`);

        // Highlight the country tile in sidebar
        this.highlightCountryTile(currentCountry.code);

        // Highlight current country on globe
        const currentPolygon = this.cachedPolygons.find(p => {
            const threeLetterCode = p.id;
            const twoLetterCode = Object.keys(this.countryCodeMap).find(key => this.countryCodeMap[key] === threeLetterCode);
            return twoLetterCode === currentCountry.code;
        });

        if (currentPolygon) {
            // Add current country polygon
            this.globe.polygonsData([currentPolygon]);
            
            // Focus on current country
            this.globe.pointOfView({ 
                lat: currentCountry.coordinates.lat, 
                lng: currentCountry.coordinates.lng, 
                altitude: 1.8 
            }, 1000);
        }

        // If there's a next country, prepare it immediately and draw arc
        if (nextCountry) {
            // Prepare next country polygon for immediate highlighting
            const nextPolygon = this.cachedPolygons.find(p => {
                const threeLetterCode = p.id;
                const twoLetterCode = Object.keys(this.countryCodeMap).find(key => this.countryCodeMap[key] === threeLetterCode);
                return twoLetterCode === nextCountry.code;
            });

            // Immediately highlight next country tile and prepare for arc
            setTimeout(() => {
                // Highlight next country tile
                this.highlightCountryTile(nextCountry.code);

                // Draw arc from current to next country
                const arc = {
                    startLat: currentCountry.coordinates.lat,
                    startLng: currentCountry.coordinates.lng,
                    endLat: nextCountry.coordinates.lat,
                    endLng: nextCountry.coordinates.lng,
                    color: ['#00ff88', '#00d4ff', '#ff6b35']
                };
                
                this.globe.arcsData([arc]);

                // After arc animation completes, move camera to next country and show its polygon
                setTimeout(() => {
                    if (nextPolygon) {
                        // Add next country polygon
                        this.globe.polygonsData([nextPolygon]);
                        
                        // Focus camera on next country
                        this.globe.pointOfView({ 
                            lat: nextCountry.coordinates.lat, 
                            lng: nextCountry.coordinates.lng, 
                            altitude: 1.8 
                        }, 1000);
                    }

                    // Move to next step after camera movement
                    setTimeout(() => {
                        this.journeyStep++;
                        this.animateJourneyStep();
                    }, this.CAMERA_MOVEMENT_DURATION); // Wait for camera movement

                }, this.ARC_ANIMATION_DURATION); // Wait for arc to complete
                
            }, this.PHASE_TRANSITION_DELAY); // Brief pause before starting next phase
        } else {
            // Last country, just wait then finish
            setTimeout(() => {
                this.journeyStep++;
                this.animateJourneyStep();
            }, this.ARC_ANIMATION_DURATION);
        }
    }

    // Add method to update globe with new data
    updateCountries() {
        if (this.globe) {
            this.globe.pointsData(TravelData.getCountries());
            this.globe.ringsData(TravelData.getCountries());
            this.globe.hexPolygonsData(TravelData.getCountries());
            this.globe.polygonsData(this.getVisitedCountriesPolygons());
        }
    }
}

console.log('Visualization module loaded.');
