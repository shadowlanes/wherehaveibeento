// Import required modules
import * as THREE from 'three';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js';
import ThreeGlobe from 'three-globe';

// Global variables
let scene, camera, renderer, controls;
let threeGlobe;
let markers = [];
let isReplaying = false;

// Add country data for local geocoding
let worldCountries = null; // Will store GeoJSON countries data

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    const container = document.getElementById('globe-container');
    
    // Check for existing username in localStorage
    const existingUsername = localStorage.getItem('globeExplorerUsername');
    
    if (existingUsername) {
        // Show welcome back message
        showWelcomeBackMessage(existingUsername);
    }
    
    // Load country boundaries data
    loadCountryData();
    
    try {
        console.log("Initializing globe...");
        initThreeGlobe(container);
        
        // Handle keyboard controls
        document.addEventListener('keydown', (event) => {
            if (!threeGlobe) return;
            
            // Rotation speed in radians
            const rotationSpeed = THREE.MathUtils.degToRad(5);
            
            switch(event.key) { 
                case 'ArrowLeft': 
                    // Manual rotation of the globe (not using controls)
                    threeGlobe.rotation.y += rotationSpeed;
                    break;
                case 'ArrowRight':
                    threeGlobe.rotation.y -= rotationSpeed;
                    break; 
                case 'ArrowUp':
                    threeGlobe.rotation.x += rotationSpeed;
                    // Limit rotation to prevent flipping
                    threeGlobe.rotation.x = Math.min(threeGlobe.rotation.x, Math.PI / 2);
                    break;
                case 'ArrowDown':
                    threeGlobe.rotation.x -= rotationSpeed;
                    // Limit rotation to prevent flipping
                    threeGlobe.rotation.x = Math.max(threeGlobe.rotation.x, -Math.PI / 2);
                    break;
            }
        });

        // Add context menu (right-click) event for placing pins
        container.addEventListener('contextmenu', handleRightClick);
        
        // Setup replay button
        document.getElementById('replay-button').addEventListener('click', replayJourney);
        
    } catch (error) {
        console.error("Error initializing globe:", error);
    }
});

// Load GeoJSON data of country boundaries
function loadCountryData() {
    fetch('https://unpkg.com/world-atlas/countries-110m.json')
        .then(response => response.json())
        .then(data => {
            console.log('Country boundaries data loaded');
            worldCountries = data;
        })
        .catch(error => {
            console.error('Failed to load country data:', error);
        });
}

function initThreeGlobe(container) {
    // Create ThreeGlobe instance
    threeGlobe = new ThreeGlobe({ waitForGlobeReady: true })
        .globeTileEngineUrl((x, y, l) => `https://tile.openstreetmap.org/${l}/${x}/${y}.png`);
    
    const globeRadius = threeGlobe.getGlobeRadius();
    
    // Setup renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Setup scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.add(threeGlobe);
    scene.add(new THREE.AmbientLight(0xcccccc, Math.PI));
    scene.add(new THREE.DirectionalLight(0xffffff, 0.6 * Math.PI));
    
    // Setup camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;
    
    // Add camera controls
    setupControls(container);
    
    // Enable auto-rotation
    enableAutoRotation();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        if (controls) controls.handleResize();
    });
    
    // Start animation loop
    animate();
    
    return threeGlobe;
}

function setupControls(container) {
    // Create TrackballControls
    controls = new TrackballControls(camera, renderer.domElement);
    
    // Configure controls
    controls.rotateSpeed = 1.5;
    controls.zoomSpeed = 0.8;
    controls.panSpeed = 0.3;
    
    controls.minDistance = 101;  // Prevent zooming too close
    controls.maxDistance = 500;  // Prevent zooming too far out
    
    controls.noPan = true; // Disable panning for simplicity
    
    // Listen for control changes
    controls.addEventListener('change', () => {
        // Update globe's point of view when camera changes
        if (threeGlobe) threeGlobe.setPointOfView(camera);
    });
    
    // Add direct mouse rotation handling (fallback)
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    container.addEventListener('mousedown', (event) => {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });
    
    document.addEventListener('mousemove', (event) => {
        if (!isDragging || !threeGlobe) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        // Apply rotation directly to the globe (fallback method)
        // This is in addition to the TrackballControls
        const rotationSpeed = 0.003;
        threeGlobe.rotation.y += deltaMove.x * rotationSpeed;
        threeGlobe.rotation.x += deltaMove.y * rotationSpeed;
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
    });
}

// Enable auto-rotation when not interacting with the globe
function enableAutoRotation() {
    let lastInteractionTime = Date.now();
    const autoRotationDelay = 3000; // ms to wait after interaction before auto-rotating
    
    // Update last interaction time when controls change
    controls.addEventListener('change', () => {
        lastInteractionTime = Date.now();
    });
    
    // Add to animation loop
    window.checkAutoRotation = () => {
        if (Date.now() - lastInteractionTime > autoRotationDelay) {
            // Auto-rotate when not interacting
            threeGlobe.rotation.y += 0.001;
        }
    };
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    if (controls) controls.update();
    
    // Check for auto-rotation
    if (window.checkAutoRotation) window.checkAutoRotation();
    
    // Render scene
    renderer.render(scene, camera);
}

function handleRightClick(event) {
    event.preventDefault();
    if (isReplaying) return;
    
    // Get mouse position
    const mouse = new THREE.Vector2(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1
    );
    
    // Create raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    
    // Find all meshes in the globe recursively
    const globeMeshes = [];
    threeGlobe.traverse((object) => {
        if (object.isMesh) {
            globeMeshes.push(object);
        }
    });
    
    // Check for intersections with any mesh in the globe
    const intersects = raycaster.intersectObjects(globeMeshes, true);
    
    if (intersects.length > 0) {
        const intersection = intersects[0];
        const point = intersection.point;
        console.log("Intersection point:", point);
        
        // Convert to lat/lng using proper conversion from the hit point
        const latLng = getLatLngFromPoint(point);
        const { lat, lng } = latLng;
        
        console.log(`Right-clicked at lat: ${lat.toFixed(2)}, lng: ${lng.toFixed(2)}`);
        
        // Get country name based on coordinates - use local data if available
        getCountryFromCoordinates(lat, lng)
            .then(countryName => {
                console.log(`Identified country: ${countryName}`);
                addPin(lat, lng, countryName);
            })
            .catch(error => {
                console.error("Error getting country:", error);
                addPin(lat, lng, "Unknown Location");
            });
    }
}

// More accurate lat/lng conversion from 3D point
function getLatLngFromPoint(point) {
    // Get a vector from globe center to the point
    const pointVector = new THREE.Vector3();
    pointVector.copy(point);
    
    // Since the globe might be rotated, we need to get its transformation matrix
    const globePosition = threeGlobe.position;
    pointVector.sub(globePosition); // Vector relative to globe center
    
    // Apply inverse of globe's world rotation to get point in standard coordinates
    const globeQuaternion = threeGlobe.quaternion;
    const inverseRotation = globeQuaternion.clone().invert();
    pointVector.applyQuaternion(inverseRotation);
    
    // Now convert to lat/lng
    const radius = threeGlobe.getGlobeRadius();
    // Normalize to get a unit vector from center to point
    pointVector.normalize();
    
    const lat = 90 - Math.acos(pointVector.y) * 180 / Math.PI;
    const lng = (Math.atan2(pointVector.x, pointVector.z) * 180 / Math.PI + 270) % 360 - 180;
    
    return { lat, lng };
}

// Function to get country name from coordinates - prioritizes local lookup
async function getCountryFromCoordinates(lat, lng) {
    // First try to identify country from local GeoJSON data
    if (worldCountries) {
        try {
            const countryName = findCountryNameFromGeoJSON(lat, lng);
            if (countryName) return countryName;
        } catch (error) {
            console.warn('Local geocoding failed, falling back to API:', error);
        }
    }
    
    // Fall back to API if local search fails or data not loaded
    try {
        console.log(`Falling back to API for coordinates: ${lat}, ${lng}`);
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();
        console.log("Geocoding API response:", data);
        return data.countryName || "Unknown";
    } catch (error) {
        console.error("Geocoding error:", error);
        return "Unknown";
    }
}

// Function to find country name from local GeoJSON data
function findCountryNameFromGeoJSON(lat, lng) {
    if (!worldCountries || !worldCountries.objects || !worldCountries.objects.countries) {
        return null;
    }
    
    const { features } = worldCountries.objects.countries;
    
    for (const feature of features) {
        if (feature.geometry && isPointInPolygon(lat, lng, feature.geometry.coordinates)) {
            return feature.properties.name;
        }
    }
    
    return null;
}

// Check if point is within a polygon (simplified point-in-polygon test)
function isPointInPolygon(lat, lng, polygonCoordinates) {
    // Note: This is a simplified implementation that would need to be 
    // enhanced for a production environment with proper geospatial point-in-polygon testing
    
    // Convert polygons to point arrays
    const polygons = Array.isArray(polygonCoordinates[0][0]) ? 
        polygonCoordinates : [polygonCoordinates];
    
    for (const polygon of polygons) {
        let inside = false;
        
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            const xi = polygon[i][0], yi = polygon[i][1];
            const xj = polygon[j][0], yj = polygon[j][1];
            
            const intersect = ((yi > lng) !== (yj > lng)) &&
                (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
            
            if (intersect) inside = !inside;
        }
        
        if (inside) return true;
    }
    
    return false;
}

// Function to add a pin at the specified coordinates
function addPin(lat, lng, label) {
    const globeRadius = threeGlobe.getGlobeRadius();
    
    // Create a marker object
    const marker = {
        id: Date.now(),
        lat,
        lng,
        label,
        color: 'red',
        initialColor: 'red'
    };
    
    // Add to markers collection
    markers.push(marker);
    
    // Convert lat/lng to 3D position in globe's coordinate system
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lng + 180) * Math.PI / 180;
    const r = globeRadius * 1.01; // Slightly above surface
    
    const x = -r * Math.sin(phi) * Math.sin(theta);
    const y = r * Math.cos(phi);
    const z = r * Math.sin(phi) * Math.cos(theta);
    
    // Apply globe's current rotation to the position
    const pinPosition = new THREE.Vector3(x, y, z);
    
    // Create pin group
    const pinGroup = new THREE.Group();
    
    // Create pin head (sphere)
    const pinHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.5, 16, 16),
        new THREE.MeshPhongMaterial({ color: marker.color })
    );
    pinGroup.add(pinHead);
    
    // Create pin body (cylinder)
    const pinBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 1, 8),
        new THREE.MeshPhongMaterial({ color: marker.color })
    );
    pinBody.position.y = -0.75;
    pinGroup.add(pinBody);
    
    // Create pin label with better visibility
    const label3d = createTextSprite(marker.label);
    label3d.position.y = 1.2;
    pinGroup.add(label3d);
    
    // Position the pin
    pinGroup.position.copy(pinPosition);
    
    // Make pin face outward from the globe center
    pinGroup.lookAt(threeGlobe.position);
    pinGroup.rotateX(Math.PI / 2); // Adjust orientation
    
    // Add pin directly to the threeGlobe object to ensure it rotates with the globe
    threeGlobe.add(pinGroup);
    marker.object = pinGroup;
    
    // Animate pin drop
    animatePinDrop(marker, pinPosition, globeRadius);
    
    return marker;
}

// Create a text sprite for marker labels with improved visibility
function createTextSprite(text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const padding = 10;
    const fontSize = 28; // Increase font size
    
    // Set canvas size based on text
    context.font = `bold ${fontSize}px Arial`; // Make text bold
    const textMetrics = context.measureText(text);
    const textWidth = textMetrics.width;
    const width = Math.max(textWidth + (padding * 2), 100); // Minimum width
    const height = fontSize + (padding * 2);
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw background with stronger opacity
    context.fillStyle = 'rgba(0, 0, 0, 0.8)'; // Darker background
    context.fillRect(0, 0, width, height);
    
    // Add border for better visibility
    context.strokeStyle = 'white';
    context.lineWidth = 2;
    context.strokeRect(2, 2, width - 4, height - 4);
    
    // Draw text
    context.font = `bold ${fontSize}px Arial`;
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, height / 2);
    
    // Create texture and sprite
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Prevent blurry text
    const material = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        depthTest: false, // Ensure label is always visible
        depthWrite: false
    });
    const sprite = new THREE.Sprite(material);
    
    // Scale sprite
    const scaleRatio = width / height;
    sprite.scale.set(scaleRatio * 3, 3, 1);
    
    return sprite;
}

// Animate a pin dropping onto the globe
function animatePinDrop(marker, finalPosition, globeRadius) {
    // Start position higher above the surface
    const direction = finalPosition.clone().normalize();
    const startPosition = direction.clone().multiplyScalar(globeRadius * 1.3);
    
    // Set initial position
    if (marker.object) {
        marker.object.position.copy(startPosition);
    }
    
    // Animate drop
    const duration = 1000; // ms
    const start = performance.now();
    
    function animate(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use bounce easing
        const bouncedProgress = bounceEaseOut(progress);
        
        // Interpolate position
        const currentPosition = new THREE.Vector3().lerpVectors(startPosition, finalPosition, bouncedProgress);
        if (marker.object) {
            marker.object.position.copy(currentPosition);
            
            // Keep the pin oriented correctly
            marker.object.lookAt(threeGlobe.position);
            marker.object.rotateX(Math.PI / 2);
        }
        
        // Continue until animation is complete
        if (progress < 1) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

// Bounce easing function
function bounceEaseOut(x) {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }
}

// Function to show welcome back message
function showWelcomeBackMessage(username) {
    // Create welcome back message element
    const welcomeBack = document.createElement('div');
    welcomeBack.textContent = `Welcome Back, ${username}!`;
    welcomeBack.style.position = 'fixed';
    welcomeBack.style.top = '20px';
    welcomeBack.style.left = '20px';
    welcomeBack.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    welcomeBack.style.color = 'white';
    welcomeBack.style.padding = '10px 15px';
    welcomeBack.style.borderRadius = '5px';
    welcomeBack.style.zIndex = '1000';
    welcomeBack.style.fontFamily = 'Arial, sans-serif';
    welcomeBack.style.fontSize = '16px';
    welcomeBack.style.transition = 'opacity 1s ease-in-out';
    
    // Add to document
    document.body.appendChild(welcomeBack);
     
    // Fade out after 3 seconds
    setTimeout(() => {
        welcomeBack.style.opacity = '0';
        // Remove from DOM after fade out
        setTimeout(() => {
            document.body.removeChild(welcomeBack);
        }, 1000);
    }, 3000);
}

// Function to replay journey through markers
function replayJourney() {
    if (markers.length < 2 || isReplaying) return;
    
    isReplaying = true;
    const replayButton = document.getElementById('replay-button');
    replayButton.textContent = 'Replaying...';
    replayButton.disabled = true;
    
    // Save current camera position and control state
    const startCameraPosition = camera.position.clone();
    const startControlsTarget = controls.target.clone();
    const controlsEnabled = controls.enabled;
    
    // Disable controls during replay
    controls.enabled = false;
    
    // Visit each marker in sequence
    let currentIndex = 0;
    
    function visitNextMarker() {
        if (currentIndex >= markers.length) {
            // Replay complete
            isReplaying = false;
            replayButton.textContent = 'Replay Journey';
            replayButton.disabled = false;
            
            // Return to original position
            animateCameraPosition(startCameraPosition, new THREE.Vector3(0, 0, 0), () => {
                controls.target.copy(startControlsTarget);
                controls.enabled = controlsEnabled;
            });
            
            return;
        }
        
        const marker = markers[currentIndex];
        
        // Highlight current marker
        if (marker.object) {
            marker.object.children[0].material.color.set('green');
        }
        
        // Calculate position to view the marker from
        const globeRadius = threeGlobe.getGlobeRadius();
        const phi = (90 - marker.lat) * Math.PI / 180;
        const theta = (marker.lng + 180) * Math.PI / 180;
        const markerPos = new THREE.Vector3(
            -globeRadius * Math.sin(phi) * Math.sin(theta),
            globeRadius * Math.cos(phi),
            globeRadius * Math.sin(phi) * Math.cos(theta)
        );
        
        // Calculate camera position to look at the marker
        const distFromGlobe = globeRadius * 0.5; // Relatively close to the marker
        const cameraPos = markerPos.clone().normalize().multiplyScalar(globeRadius + distFromGlobe);
        
        // Animate camera to look at marker
        animateCameraPosition(cameraPos, markerPos, () => {
            // After we reach the marker, wait a bit and then move on
            setTimeout(() => {
                // Reset marker color
                if (marker.object) {
                    marker.object.children[0].material.color.set(marker.initialColor);
                }
                
                // Move to next marker
                currentIndex++;
                visitNextMarker();
            }, 1000);
        });
    }
    
    // Start replay
    visitNextMarker();
}

// Animate camera movement
function animateCameraPosition(targetPos, lookAtPos, callback) {
    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    
    const duration = 1000; // ms
    const start = performance.now();
    
    function animate(time) {
        const elapsed = time - start;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use smooth easing
        const easedProgress = easeInOutCubic(progress);
        
        // Update camera position
        camera.position.lerpVectors(startPos, targetPos, easedProgress);
        
        // Update look-at target
        controls.target.lerpVectors(startTarget, lookAtPos, easedProgress);
        controls.update();
        
        // Update globe's point of view to match camera
        threeGlobe.setPointOfView(camera);
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else if (callback) {
            callback();
        }
    }
    
    requestAnimationFrame(animate);
}

// Easing function
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
