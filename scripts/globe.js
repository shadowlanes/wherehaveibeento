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

    // Try to load texture
    textureLoader.load(
        'assets/world-map.jpg',
        function(texture) {
            // Success - replace material with textured one
            console.log("Texture loaded successfully");
            const globeMaterial = new THREE.MeshPhongMaterial({
                map: texture,
                bumpScale: 0.02,
            });
            globe.material = globeMaterial;
        },
        undefined,
        function(error) {
            // Error handling
            console.error("Error loading texture:", error);
        }
    );

    // Set up mouse and touch events
    setupEvents(container);

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    return globe;
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
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Auto-rotation (very slow)
    if (!isDragging && globe) {
        globe.rotation.y += 0.001;
    }

    renderer.render(scene, camera);
}
