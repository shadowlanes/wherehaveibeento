// Visualization module for Globe.gl
console.log('Loading visualization.js...');

class GlobeVisualization {
    constructor(containerId) {
        console.log('Creating GlobeVisualization with container:', containerId);
        this.container = document.getElementById(containerId);
        this.tooltip = document.getElementById('tooltip');
        this.globe = null;
        this.init();
    }

    init() {
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

        // Initialize Globe.gl with container
        this.globe = Globe()(this.container)
            .globeImageUrl('assets/earth-night.jpg')
            .backgroundImageUrl('assets/night-sky.png')
            .showAtmosphere(true)
            .atmosphereColor('#00d4ff')
            .atmosphereAltitude(0.25)
            .width(this.getResponsiveWidth())
            .height(this.getResponsiveHeight())
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

    // Add method to update globe with new data
    updateCountries() {
        if (this.globe) {
            this.globe.pointsData(TravelData.getCountries());
        }
    }
}

console.log('Visualization module loaded.');
