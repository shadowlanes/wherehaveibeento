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
                
                // Convert 3D point to lat/long with improved accuracy,
                // accounting for the globe's rotation
                const coords = cartesianToLatLng(point);
                
                console.log(`Clicked at 3D point: ${point.x.toFixed(2)}, ${point.y.toFixed(2)}, ${point.z.toFixed(2)}`);
                console.log(`Converted to lat/lng: ${coords.lat.toFixed(2)}, ${coords.lng.toFixed(2)}`);
                
                // Get country name based on coordinates
                getCountryFromCoordinates(coords.lat, coords.lng).then(countryName => {
                    console.log(`Identified country: ${countryName}`);
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
function cartesianToLatLng(worldPoint) {
    // Transform worldPoint to the globe's local space
    globe.updateMatrixWorld();
    const inverseGlobeMatrix = new THREE.Matrix4().copy(globe.matrixWorld).invert();
    const localPoint = worldPoint.clone().applyMatrix4(inverseGlobeMatrix);

    // Assume the globe's radius is 2, with +Y as "north pole"
    const radius = 2;
    // Make sure we don't exceed radius
    const normalizedY = Math.max(-radius, Math.min(radius, localPoint.y));

    // Latitude: -90 (south pole) to +90 (north pole)
    const lat = Math.asin(normalizedY / radius) * (180 / Math.PI);

    // Longitude: -180 to +180
    // Note the negative Z since typical lat/long expects zero at prime meridian along Z= -∞
    const lng = Math.atan2(localPoint.x, -localPoint.z) * (180 / Math.PI);

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
function addPin(worldPoint, countryName) {
    // Transform the clicked point from world space to the globe's local space
    globe.updateMatrixWorld();
    const inverseGlobeMatrix = new THREE.Matrix4().copy(globe.matrixWorld).invert();
    const localPoint = worldPoint.clone().applyMatrix4(inverseGlobeMatrix);

    // Calculate surface and start positions in local space
    const surfaceLocal = localPoint.clone().normalize().multiplyScalar(2);
    const startLocal = localPoint.clone().normalize().multiplyScalar(3);

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
    pinBody.position.y = -pinHeight / 2;

    const pinGroup = new THREE.Group();
    pinGroup.add(pinHead);
    pinGroup.add(pinBody);

    // Save final surface position in userData for reference
    pinGroup.userData.surfacePosition = surfaceLocal.clone();

    // Create a wrapper Object3D that's placed in the globe's local coordinates
    const pinWrapper = new THREE.Object3D();
    pinWrapper.position.copy(surfaceLocal);

    // Orient the pin so it faces outward
    const lookAtLocal = surfaceLocal.clone().multiplyScalar(2);
    pinWrapper.lookAt(lookAtLocal);

    // Add the pin group to the wrapper
    pinWrapper.add(pinGroup);

    // Start position offset in local coords
    // We'll animate along the wrapper's local z-axis
    const distanceOffset = startLocal.distanceTo(surfaceLocal) - 2;
    pinGroup.position.set(0, 0, distanceOffset);

    // Create text label (country name)
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

    // Finally, add the pin wrapper to the globe
    globe.add(pinWrapper);

    // Animate the pin falling
    const duration = 1000;
    const startTime = Date.now();

    function animatePin() {
        const elapsedTime = Date.now() - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        pinGroup.position.z = (1 - progress) * distanceOffset;
        if (progress < 1) requestAnimationFrame(animatePin);
    }
    animatePin();

    // Store the marker for replay
    markers.push({
        wrapper: pinWrapper,
        object: pinGroup,
        position: surfaceLocal.clone(),
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
