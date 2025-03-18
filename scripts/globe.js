let scene, camera, renderer, globe;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };
const minZoom = 2;
const maxZoom = 10;

export function initGlobe(container) {
    console.log("Initializing globe...");

    // Create scene
    scene = new THREE.Scene();
    console.log("Scene created");  

    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    console.log("Camera created"); 

    // Expose scene and camera to window object for access from main.js
    window.scene = scene;
    window.camera = camera;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true  });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    console.log("Renderer created and added to container");

    // Create globe with fallback texture
    const textureLoader = new THREE.TextureLoader();
    const globeGeometry = new THREE.SphereGeometry(2, 32, 32);

    // Add basic material in case texture fails to load
    const defaultMaterial = new THREE.MeshPhongMaterial({
        color: 0x2233ff,
        wireframe: false,
    });

    globe = new THREE.Mesh(globeGeometry, defaultMaterial);
    scene.add(globe);
    console.log("Globe created and added to scene");

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    console.log("Ambient light added");

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);
    console.log("Point light added");

    // Start animation immediately
    animate();

    // Load Earth texture with proper OSM mapping
    loadOSMTextureForGlobe();

    // Set up mouse and touch events
    setupEvents(container);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    return globe;
}

// Load OpenStreetMap tiles and map them to a globe texture
function loadOSMTextureForGlobe() {
    // For simplicity, we'll use a single OSM world map image
    // This works better than trying to stitch individual tiles in Three.js
    const worldMapUrl = 'https://c.tile.openstreetmap.org/3/4/2.png';

    // Create a canvas to stitch multiple tiles if needed
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Fill with light blue background color for oceans
    ctx.fillStyle = '#a4bfef';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load the main map image
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = function() {
        // Draw the map on the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        
        // Apply the texture to the globe
        globe.material = new THREE.MeshPhongMaterial({
            map: texture,
            bumpScale: 0.02,
        });
        console.log("OSM texture applied to globe");
    };
    
    // Fallback - load a backup texture if OSM fails
    img.onerror = function() {
        console.error("Failed to load OSM texture, using backup");
        const backupTexture = new THREE.TextureLoader().load(
            'https://cdn.jsdelivr.net/npm/three/examples/textures/land_ocean_ice_cloud_2048.jpg',
            function(texture) {
                globe.material = new THREE.MeshPhongMaterial({
                    map: texture,
                    bumpScale: 0.02,
                });
            }
        );
    };
    
    img.src = worldMapUrl;
}

// Update texture based on zoom level
function updateGlobeTexture(zoomLevel) {
    // Only update texture if significantly zoomed in or out (save bandwidth)
    const zoomThreshold = 3; // Adjust as needed
    if (zoomLevel <= zoomThreshold) {
        // For far zooms, use a single map image
        const worldMapUrl = 'https://c.tile.openstreetmap.org/2/2/1.png';
        
        const texture = new THREE.TextureLoader();
        texture.crossOrigin = 'Anonymous';
        texture.load(
            worldMapUrl,
            (texture) => {
                globe.material.map = texture;
                globe.material.needsUpdate = true;
            }
        );
    } else {
        // Load multiple higher resolution tiles for closer zooms
        // This is a placeholder - real implementation would use proper tile math
        const zoom = Math.min(5, Math.floor(zoomLevel));
        const worldMapUrl = `https://c.tile.openstreetmap.org/${zoom}/15/15.png`;
        
        const texture = new THREE.TextureLoader();
        texture.crossOrigin = 'Anonymous';
        texture.load(
            worldMapUrl,
            (texture) => {
                globe.material.map = texture;
                globe.material.needsUpdate = true;
            }
        );
    }
}

function setupEvents(container) {
    // Mouse events
    container.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    // Touch events
    container.addEventListener('touchstart', onTouchStart);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchend', onTouchEnd);

    // Scroll events for zoom
    container.addEventListener('wheel', onMouseWheel);
}

function onMouseDown(event) {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseMove(event) {
    if (!isDragging || !globe) return;

    const deltaMove = {
        x: event.clientX - previousMousePosition.x,
        y: event.clientY - previousMousePosition.y
    };

    // Rotate the globe based on mouse movement
    globe.rotation.y += deltaMove.x * 0.005;
    globe.rotation.x += deltaMove.y * 0.005;

    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
}

function onMouseUp() {
    isDragging = false;
}

function onTouchStart(event) {
    if (event.touches.length === 1) {
        isDragging = true;
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
}

function onTouchMove(event) {
    if (!isDragging || !globe) return;

    const deltaMove = {
        x: event.touches[0].clientX - previousMousePosition.x,
        y: event.touches[0].clientY - previousMousePosition.y
    };

    // Rotate the globe based on touch movement
    globe.rotation.y += deltaMove.x * 0.005;
    globe.rotation.x += deltaMove.y * 0.005;

    previousMousePosition = {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY
    };
}

function onTouchEnd() {
    isDragging = false;
}

function onMouseWheel(event) {
    if (!camera) return;

    // Zoom based on scroll wheel
    const zoomAmount = camera.position.z + Math.sign(event.deltaY) * 0.5;

    // Limit zoom
    if (zoomAmount >= minZoom && zoomAmount <= maxZoom) {
        camera.position.z = zoomAmount;
        // Call texture update with debounce to prevent too many requests
        clearTimeout(window.zoomDebounce);
        window.zoomDebounce = setTimeout(() => {
            updateGlobeTexture(zoomAmount);
        }, 200);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Rotate only if fully zoomed out
    if (!isDragging && globe && camera.position.z >= maxZoom) {
        globe.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}
