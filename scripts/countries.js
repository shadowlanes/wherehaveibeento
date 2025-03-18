// This file provides a more advanced, optimized implementation for country detection

/**
 * Efficient country detection using R-trees and preloaded GeoJSON
 */

// Cache for GeoJSON data
let countryData = null;
let countryIndex = null;

// Load and initialize country data
export async function initCountryData() {
    if (countryData) return countryData;
    
    try {
        // Fetch country boundaries (topojson format)
        const response = await fetch('https://unpkg.com/world-atlas/countries-110m.json');
        const topoData = await response.json();
        
        // Convert to GeoJSON format
        countryData = topojson.feature(topoData, topoData.objects.countries);
        
        // Build spatial index for fast lookups
        countryIndex = buildSpatialIndex(countryData.features);
        
        return countryData;
    } catch (error) {
        console.error('Failed to load country data:', error);
        return null;
    }
}

// Build a simple spatial index for countries
function buildSpatialIndex(features) {
    const index = {};
    
    features.forEach(feature => {
        const bounds = getBounds(feature.geometry);
        const id = feature.id;
        
        // Create grid cells for this feature
        const latMin = Math.floor(bounds.latMin / 10) * 10;
        const latMax = Math.ceil(bounds.latMax / 10) * 10;
        const lngMin = Math.floor(bounds.lngMin / 10) * 10;
        const lngMax = Math.ceil(bounds.lngMax / 10) * 10;
        
        // Add feature to all grid cells it intersects
        for (let lat = latMin; lat < latMax; lat += 10) {
            for (let lng = lngMin; lng < lngMax; lng += 10) {
                const cellKey = `${lat},${lng}`;
                if (!index[cellKey]) index[cellKey] = [];
                index[cellKey].push(id);
            }
        }
    });
    
    return index;
}

// Get bounds of a GeoJSON geometry
function getBounds(geometry) {
    let latMin = 90, latMax = -90, lngMin = 180, lngMax = -180;
    
    function processCoordinates(coords) {
        if (Array.isArray(coords[0]) && typeof coords[0][0] === 'number') {
            // It's a point array
            coords.forEach(point => {
                latMin = Math.min(latMin, point[1]);
                latMax = Math.max(latMax, point[1]);
                lngMin = Math.min(lngMin, point[0]);
                lngMax = Math.max(lngMax, point[0]);
            });
        } else if (Array.isArray(coords[0])) {
            // It's nested arrays
            coords.forEach(processCoordinates);
        }
    }
    
    processCoordinates(geometry.coordinates);
    
    return { latMin, latMax, lngMin, lngMax };
}

// Find country at a specific coordinate
export function findCountryAt(lat, lng) {
    if (!countryData || !countryIndex) return null;
    
    // Get grid cell
    const cellLat = Math.floor(lat / 10) * 10;
    const cellLng = Math.floor(lng / 10) * 10;
    const cellKey = `${cellLat},${cellLng}`;
    
    // Get candidate features from this cell
    const candidates = countryIndex[cellKey] || [];
    
    // Check each candidate using point-in-polygon
    for (const id of candidates) {
        const feature = countryData.features.find(f => f.id === id);
        if (feature && pointInPolygon([lng, lat], feature.geometry)) {
            return feature.properties.name;
        }
    }
    
    return null;
}

// Point-in-polygon test
function pointInPolygon(point, geometry) {
    // Implementation of ray-casting algorithm for point-in-polygon
    // This is a simplified version for illustration
    
    // Handle different geometry types
    if (geometry.type === 'Polygon') {
        return pointInSinglePolygon(point, geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
        return geometry.coordinates.some(polygon => 
            pointInSinglePolygon(point, polygon));
    }
    
    return false;
}

function pointInSinglePolygon(point, polygon) {
    // Check if point is inside the first ring (outer)
    // and outside all other rings (holes)
    const [lng, lat] = point;
    const outerRing = polygon[0];
    
    if (!pointInRing(lng, lat, outerRing)) {
        return false;
    }
    
    // Check that the point is not inside any holes
    for (let i = 1; i < polygon.length; i++) {
        if (pointInRing(lng, lat, polygon[i])) {
            return false;
        }
    }
    
    return true;
}

function pointInRing(lng, lat, ring) {
    let inside = false;
    
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const xi = ring[i][0], yi = ring[i][1];
        const xj = ring[j][0], yj = ring[j][1];
        
        const intersect = ((yi > lat) !== (yj > lat)) &&
            (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
        
        if (intersect) inside = !inside;
    }
    
    return inside;
}
