import { initGlobe } from './globe.js';

// Track markers for replay functionality
let markers = [];
let isReplaying = false;
let globe; // Store globe reference globally

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    const container = document.getElementById('globe-container');
    
    // Check for existing username in localStorage
    const existingUsername = localStorage.getItem('globeExplorerUsername');
    
    if (existingUsername) {
        // Show welcome back message
        showWelcomeBackMessage(existingUsername);  
    }
    
    try {
        console.log("Initializing globe...");
        globe = initGlobe(container);
        
        // Handle keyboard controls
        document.addEventListener('keydown', (event) => {
            // Rotation speed
            const rotationSpeed = 0.05;
                
            switch(event.key) { 
                case 'ArrowLeft': 
                    globe.rotation.y += rotationSpeed;
                    break;
                case 'ArrowRight':
                    globe.rotation.y -= rotationSpeed;
                    break; 
                case 'ArrowUp':
                    globe.rotation.x += rotationSpeed;
                    break;
                case 'ArrowDown':
                    globe.rotation.x -= rotationSpeed;
                    break;
            }
        });

        // Handle right-click for placing pins
        container.addEventListener('contextmenu', (event) => {
            event.preventDefault(); 
            
            // Get mouse position
            const mouse = new THREE.Vector2(
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1
            );
            
            // Create raycaster
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, window.camera);
            
            // Check for intersections with the globe
            const intersects = raycaster.intersectObject(globe);
            
            if (intersects.length > 0) {
                const point = intersects[0].point.clone();
                const worldPosition = point.clone(); // Save world position for API call
                
                // Convert 3D point to lat/long with improved accuracy
                const coords = cartesianToLatLng(point);
                
                // Get country name based on coordinates
                getCountryFromCoordinates(coords.lat, coords.lng).then(countryName => {
                    // Add pin with animation
                    addPin(point, countryName);
                }).catch(error => {
                    console.error("Error getting country:", error);
                    // Still add pin, but with unknown label
                    addPin(point, "Unknown Location");
                });
            }
        });
        
        // Setup replay button
        document.getElementById('replay-button').addEventListener('click', () => {
            replayJourney();
        });
        
    } catch (error) {
        console.error("Error initializing globe:", error);
    }
});

// Helper function to convert cartesian coordinates to lat/lng
function cartesianToLatLng(point) {
    // Normalize to the unit sphere first
    const radius = 2; // Our globe radius
    const normalized = point.clone().divideScalar(radius);
    
    // Calculate latitude: -90 to 90 degrees
    const lat = 90 - (Math.acos(normalized.y) * 180 / Math.PI);
    
    // Calculate longitude: -180 to 180 degrees
    let lng = Math.atan2(normalized.x, normalized.z) * 180 / Math.PI;
    
    return { lat, lng };
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

// Function to get country name from coordinates
async function getCountryFromCoordinates(lat, lng) {
    try {
        // Use a reverse geocoding API
        console.log(`Getting country for coordinates: ${lat}, ${lng}`);
        const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
        const data = await response.json();
        console.log("Geocoding response:", data);
        return data.countryName || "Unknown";
    } catch (error) {
        console.error("Geocoding error:", error);
        return "Unknown";
    }
}

// Function to add an animated pin
function addPin(position, countryName) {
    // Create pin geometry
    const pinHeight = 0.3;
    const pinHeadRadius = 0.04;
    const pinColor = 0xff0000;
    
    // Create pin head (sphere)
    const pinHead = new THREE.Mesh(
        new THREE.SphereGeometry(pinHeadRadius, 16, 16),
        new THREE.MeshBasicMaterial({ color: pinColor })
    );
    
    // Create pin body (cylinder)
    const pinBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.01, 0.01, pinHeight, 8),
        new THREE.MeshBasicMaterial({ color: pinColor })
    );
    
    // Position pin body
    pinBody.position.y = -pinHeight/2;
    
    // Create pin group
    const pinGroup = new THREE.Group();
    pinGroup.add(pinHead);
    pinGroup.add(pinBody);
    
    // Calculate the normalized position on the globe surface
    const surfacePosition = position.clone().normalize().multiplyScalar(2);
    
    // Calculate the pin start position for animation
    const startPosition = position.clone().normalize().multiplyScalar(3);
    
    // Store the final surface position for the pin
    pinGroup.userData.surfacePosition = surfacePosition.clone();
    
    // Create a wrapper object that will be attached to the globe
    // This wrapper will maintain the pin's position relative to the globe
    const pinWrapper = new THREE.Object3D();
    pinWrapper.position.copy(surfacePosition);
    
    // Make the pin face outward from the center of the globe
    const lookAtPosition = surfacePosition.clone().multiplyScalar(2);
    pinWrapper.lookAt(lookAtPosition);
    
    // Add the pin group to the wrapper
    pinWrapper.add(pinGroup);
    
    // Set initial position for animation
    pinGroup.position.set(0, 0, startPosition.distanceTo(surfacePosition) - 2);
    
    // Create text label for country name
    const textCanvas = document.createElement('canvas');
    const context = textCanvas.getContext('2d');
    textCanvas.width = 256;
    textCanvas.height = 64;
    
    // Draw background
    context.fillStyle = 'rgba(0, 0, 0, 0.7)';
    context.fillRect(0, 0, textCanvas.width, textCanvas.height);
    
    // Draw text
    context.font = 'bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(countryName, textCanvas.width / 2, textCanvas.height / 2);
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(textCanvas);
    
    // Create sprite material
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true
    });
    
    // Create sprite
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);
    sprite.position.z = 0.2;
    
    // Add sprite to pin group
    pinGroup.add(sprite);
    
    // KEY CHANGE: Add the wrapper to the globe instead of directly to the scene
    globe.add(pinWrapper);
    
    // Animate pin falling
    const duration = 1000; // ms
    const startTime = Date.now();
    
    function animatePin() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        
        // Animate the pin along the z-axis of its local coordinate system
        pinGroup.position.z = (1 - progress) * (startPosition.distanceTo(surfacePosition) - 2);
        
        // Continue animation until complete
        if (progress < 1) {
            requestAnimationFrame(animatePin);
        }
    }
    
    // Start animation
    animatePin();
    
    // Save marker and its position for replay
    markers.push({
        wrapper: pinWrapper,
        object: pinGroup,
        position: surfacePosition.clone(),
        index: markers.length
    });
    
    return pinWrapper;
}

// Function to replay journey
function replayJourney() {
    if (markers.length < 2 || isReplaying) return;
    
    isReplaying = true;
    const replayButton = document.getElementById('replay-button');
    replayButton.textContent = 'Replaying...';
    replayButton.disabled = true;
    
    // Save current globe rotation
    const originalRotation = {
        x: globe.rotation.x,
        y: globe.rotation.y,
        z: globe.rotation.z
    };
    
    let currentIndex = 0;
    
    function animateToNextPoint() {
        if (currentIndex >= markers.length - 1) {
            // Replay complete
            isReplaying = false;
            replayButton.textContent = 'Replay Journey';
            replayButton.disabled = false;
            
            // Restore original rotation
            globe.rotation.x = originalRotation.x;
            globe.rotation.y = originalRotation.y;
            globe.rotation.z = originalRotation.z;
            return;
        }
        
        const currentMarker = markers[currentIndex];
        const nextMarker = markers[currentIndex + 1];
        
        // Highlight current marker
        const originalColor = currentMarker.object.children[0].material.color.clone();
        currentMarker.object.children[0].material.color.set(0x00ff00);
        
        // Calculate target quaternion to see this location on the globe
        const p1 = currentMarker.position.clone();
        const p2 = nextMarker.position.clone();
        
        // Find the midpoint between the two points
        const midPoint = p1.clone().add(p2).divideScalar(2).normalize().multiplyScalar(2);
        
        // Orient the globe so this midpoint is at the front (negative z-axis)
        const targetQuaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 0, -1),
            midPoint.clone().normalize()
        );
        
        const startQuaternion = globe.quaternion.clone();
        const animationDuration = 1000; // 1 second
        const startTime = Date.now();
        
        function rotateStep() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / animationDuration, 1);
            
            // Smoothly interpolate rotation using quaternions
            THREE.Quaternion.slerp(
                startQuaternion, 
                targetQuaternion, 
                globe.quaternion, 
                progress
            );
            
            if (progress < 1) {
                requestAnimationFrame(rotateStep);
            } else {
                // Reset marker color
                currentMarker.object.children[0].material.color.copy(originalColor);
                
                // Move to next marker
                currentIndex++;
                setTimeout(animateToNextPoint, 500);
            }
        }
        
        rotateStep();
    }
    
    // Start animation
    animateToNextPoint();
}
