import { initGlobe } from './globe.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content loaded");
    const container = document.getElementById('globe-container');
    
    try {
        console.log("Initializing globe...");
        const globe = initGlobe(container);
        
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
    } catch (error) {
        console.error("Error initializing globe:", error);
    }
});
