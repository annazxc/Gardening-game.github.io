let markerPosition = {
    top: 0.5,  
    left: 0.5,
    level: 0
};

//percentage of map per keypress
const moveSpeed = 0.02;

function setupControls() {
    const marker = document.getElementById("marker");
    const mobileControls = document.getElementById("mobile-controls");
    const mapContainer = document.getElementById("map-container");

    //mobile controls
    if ('ontouchstart' in window) {
        mobileControls.style.display = "flex";
        setupMobileControls();
    }
    mapContainer.tabIndex = 0;
    mapContainer.focus();
    mapContainer.addEventListener('click', function() {
        this.focus();
    });
    
    const handleKeyDown = function(e) {
        console.log("Key pressed:", e.key);
        
        switch(e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                console.log("Moving up");
                moveMarker(0, -moveSpeed);
                e.preventDefault(); 
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                console.log("Moving down");
                moveMarker(0, moveSpeed);
                e.preventDefault();
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                console.log("Moving left");
                moveMarker(-moveSpeed, 0);
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                console.log("Moving right");
                moveMarker(moveSpeed, 0);
                e.preventDefault();
                break;
        }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    mapContainer.addEventListener('keydown', handleKeyDown);
    console.log("Controls setup complete");
}

function setupMobileControls() {
    document.getElementById("up").addEventListener('click', () => moveMarker(0, -moveSpeed));
    document.getElementById("down").addEventListener('click', () => moveMarker(0, moveSpeed));
    document.getElementById("left").addEventListener('click', () => moveMarker(-moveSpeed, 0));
    document.getElementById("right").addEventListener('click', () => moveMarker(moveSpeed, 0));
}

function moveMarker(deltaX, deltaY) {
    const marker = document.getElementById("marker");
    
    markerPosition.left += deltaX;
    markerPosition.top += deltaY;
    
    markerPosition.left = Math.max(0, Math.min(1, markerPosition.left));
    markerPosition.top = Math.max(0, Math.min(1, markerPosition.top));
    
    marker.style.left = `${markerPosition.left * 100}%`;
    marker.style.top = `${markerPosition.top * 100}%`;
}


function checkLocation() {
    const threshold = 0.5; 
    let nearestPlace = null;
    let minDistance = Infinity;

    for (const id in places) {
        const place = places[id];

        if (place.level === markerPosition.level) {
            const dx = Math.abs(place.left - markerPosition.left);
            const dy = Math.abs(place.top - markerPosition.top);
            const distance = Math.sqrt(dx * dx + dy * dy); 

            if (distance < threshold && distance < minDistance) {
                nearestPlace = place;
                minDistance = distance;
            }
        }
    }
    return {nearestPlace, minDistance};
}


function initializeControls() {
    setupControls();
    document.getElementById("startExploringBtn").onclick = function() {
        const { nearestPlace, minDistance } = checkLocation();
    
        if (nearestPlace) {
            alert(`Nearest Place: ${nearestPlace.info}, Distance: ${minDistance.toFixed(2)} m`);
        } else {
            alert("No nearby locations.");
        }
    };
    document.getElementById("worldMapBtn").onclick = function() {
        window.location.href = "https://annazxc.github.io/Gardening-game.github.io/QR.html"
    };
}
window.onload = initializeControls;
